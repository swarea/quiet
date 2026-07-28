// Package the skin as a versioned archive.
//
// A blog's skin editor takes loose files, so `dist/` is what actually gets
// uploaded — but an upload is not a release. Without an archive tied to a
// version there is no way to reinstall a build that was known to work, and no
// way to tell someone which build they are running. This makes that artefact.
//
// The archive is written by hand rather than by shelling out to `zip`, which
// is not present on every machine this runs on, and rather than by adding a
// dependency for sixty lines of well-specified format. Every entry is stamped
// with the same fixed timestamp, so identical content produces an identical
// archive and the checksum means something.

import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, sep } from "node:path";
import { readFile, readdir, writeFile, mkdir, stat } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
// Call the scripts directly rather than through npm: npm resolves to a .cmd on
// Windows, which current Node refuses to spawn without a shell, and going
// through the shell to reach a node script this file already knows the path of
// buys nothing.
function node(script, args = []) {
  execFileSync(process.execPath, [join(__dirname, script), ...args], {
    cwd: root,
    stdio: "inherit",
  });
}

// ---------------------------------------------------------------- zip writer

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

// 1980-01-01 00:00, the earliest the format can express. Fixed on purpose:
// a release archive should depend on its contents and nothing else.
const DOS_TIME = 0;
const DOS_DATE = 0x0021;

function zip(entries) {
  const locals = [];
  const central = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const deflated = deflateRawSync(data, { level: 9 });
    // Storing is smaller than deflating for already-compressed bytes.
    const stored = deflated.length >= data.length;
    const body = stored ? data : deflated;
    const method = stored ? 0 : 8;
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBuf, body);

    const dir = Buffer.alloc(46);
    dir.writeUInt32LE(0x02014b50, 0);
    dir.writeUInt16LE(20, 4);
    dir.writeUInt16LE(20, 6);
    dir.writeUInt16LE(0, 8);
    dir.writeUInt16LE(method, 10);
    dir.writeUInt16LE(DOS_TIME, 12);
    dir.writeUInt16LE(DOS_DATE, 14);
    dir.writeUInt32LE(crc, 16);
    dir.writeUInt32LE(body.length, 20);
    dir.writeUInt32LE(data.length, 24);
    dir.writeUInt16LE(nameBuf.length, 28);
    dir.writeUInt32LE(0, 30); // extra + comment length
    dir.writeUInt16LE(0, 34); // disk number
    dir.writeUInt16LE(0, 36); // internal attributes
    // Unix mode 0644 in the high half. Shifting into bit 31 overflows a signed
    // 32-bit value, so it is coerced back to unsigned before being written.
    dir.writeUInt32LE((0o100644 << 16) >>> 0, 38); // external attributes
    dir.writeUInt32LE(offset, 42);
    central.push(dir, nameBuf);

    offset += local.length + nameBuf.length + body.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...locals, centralBuf, end]);
}

// ---------------------------------------------------------------- collect

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
}

// ---------------------------------------------------------------- run

const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const { name, version } = pkg;

// A release must be reproducible from a commit, so refuse to build one from a
// tree that has changes nobody can check out again.
const dirty = execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim();
if (dirty && !process.argv.includes("--allow-dirty")) {
  console.error("refusing to package a dirty working tree:\n" + dirty);
  console.error("commit first, or pass --allow-dirty to build a throwaway archive.");
  process.exit(1);
}
const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim();

// In CI the tag is what a reader sees; the archive is named from the manifest.
// If those disagree the release announces one version and contains another.
const tag = process.env.GITHUB_REF_NAME;
if (tag && tag !== `v${version}`) {
  console.error(`tag ${tag} does not match version ${version} in package.json`);
  console.error("bump the version and commit it, or retag.");
  process.exit(1);
}

console.log(`\n== build ==`);
node("build.mjs");
console.log(`\n== gate ==`);
node("check.mjs");

const dist = join(root, "dist");
await stat(dist).catch(() => {
  console.error("dist/ is missing after the build");
  process.exit(1);
});

// The gate checks the sources. Nothing checked the artefact, which is the only
// thing a blogger ever sees — and the first run of this script found a preview
// image documented in the spec but absent from every build.
const REQUIRED = [
  "skin.html",
  "style.css",
  "index.xml",
  "images/app.js",
  "preview.gif",      // 112x84, Tistory's fallback thumbnail
  "preview256.jpg",   // 256x192, active skin
  "preview560.jpg",   // 560x420, skin list
  "preview1600.jpg",  // 1600x1200, detail view
];

const files = (await walk(dist)).sort();
const entries = [];
for (const file of files) {
  entries.push({
    name: relative(dist, file).split(sep).join("/"),
    data: await readFile(file),
  });
}

const present = new Set(entries.map((e) => e.name));
const absent = REQUIRED.filter((r) => !present.has(r));
if (absent.length) {
  console.error(`
the package is missing files the skin spec requires: ${absent.join(", ")}`);
  console.error("see docs/tistory-spec.md; a release must not ship an incomplete package.");
  process.exit(1);
}

const outDir = join(root, "release");
await mkdir(outDir, { recursive: true });
// A throwaway build and a real one were indistinguishable once the file moved.
const base = dirty ? `${name}-${version}-dirty-${commit}` : `${name}-${version}`;
const archive = zip(entries);
await writeFile(join(outDir, `${base}.zip`), archive);

const sha = createHash("sha256").update(archive).digest("hex");
await writeFile(join(outDir, `${base}.zip.sha256`), `${sha}  ${base}.zip\n`);

console.log(`\n== packaged ==`);
console.log(`  release/${base}.zip   ${(archive.length / 1024).toFixed(1)} KiB, ${entries.length} files, from ${commit}`);
for (const entry of entries) console.log(`    ${entry.name}`);
console.log(`  sha256  ${sha}`);
// The changelog entry for this version is the release note. Generated notes
// list commits, which answers "what was done" rather than "should I upgrade",
// and this repository already writes the second answer by hand.
const LF = String.fromCharCode(10);
const notesPath = join(root, "release", `notes-${version}.md`);
const changelog = await readFile(join(root, "CHANGELOG.md"), "utf8");
const section = changelog.split(/^## /m).find((s) => s.startsWith(version + LF));
if (!section) {
  console.error(`${LF}CHANGELOG.md has no section for ${version}. Add one before releasing.`);
  process.exit(1);
}
// GitHub renders a single newline in release notes as a line break, unlike a
// Markdown file, where it is a space. The changelog is hard-wrapped at 80
// columns for reading in the repository, so left alone every one of those wraps
// would show up as a break and chop the sentences apart. Unwrap each paragraph
// and each list item back into one line and let the page wrap them itself.
const unwrap = (text) => {
  const out = [];
  for (const line of text.split(LF)) {
    const starts = /^\s*$|^\s*[-*]\s|^#{1,6}\s|^\s*\d+\.\s|^\s*[>|]|^\s*```/.test(line);
    const afterBlank = out.length > 0 && out[out.length - 1] === "";
    if (starts || afterBlank || out.length === 0) out.push(line.replace(/\s+$/, ""));
    else out[out.length - 1] += " " + line.trim();
  }
  return out.join(LF);
};

await writeFile(
  notesPath,
  `## What changed${LF}${LF}${unwrap(section.slice(version.length).trim())}${LF}`,
);

console.log(`${LF}notes:  ${relative(root, notesPath)}`);
console.log(
  `next:   gh release create v${version} release/${base}.zip release/${base}.zip.sha256` +
    ` --title "Quiet ${version}" --notes-file ${relative(root, notesPath)}`,
);
