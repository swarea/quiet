// Single validation gate. Local and CI call this same file.
// Honest by design: reports exactly which checks ran, and never prints a false
// "passed". Exit code is non-zero if any check fails.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile, readdir, stat } from "node:fs/promises";
import esbuild from "esbuild";
import { transform } from "lightningcss";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const ran = [];
const failures = [];
function ok(name) { ran.push(name); }
function fail(name, detail) { ran.push(name); failures.push(`${name}: ${detail}`); }

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

// 1. TypeScript bundles cleanly.
try {
  await esbuild.build({
    entryPoints: [join(root, "src", "scripts", "main.ts")],
    bundle: true,
    write: false,
    format: "iife",
    target: ["es2020"],
    logLevel: "silent",
  });
  ok("script bundle");
} catch (e) {
  fail("script bundle", e.message.split("\n")[0]);
}

// 2. CSS compiles without syntax errors.
try {
  const files = ["tokens", "base", "layout", "home", "article", "states", "tistory"];
  const parts = [];
  for (const f of files) parts.push(await readFile(join(root, "src", "styles", `${f}.css`), "utf8"));
  transform({ filename: "check.css", code: Buffer.from(parts.join("\n")), minify: false });
  ok("style compile");
} catch (e) {
  fail("style compile", e.message.split("\n")[0]);
}

// 3. Required source files exist.
try {
  const required = [
    "src/templates/layout.njk",
    "src/templates/views/home.njk",
    "src/templates/views/article.njk",
    "preview/fixtures.mjs",
    "package.json",
  ];
  const missing = [];
  for (const r of required) {
    try { await stat(join(root, r)); } catch { missing.push(r); }
  }
  if (missing.length) fail("required files", `missing ${missing.join(", ")}`);
  else ok("required files");
} catch (e) {
  fail("required files", e.message);
}

// 4. No leftover TODO/FIXME markers in source.
try {
  const src = join(root, "src");
  const hits = [];
  for (const file of await walk(src)) {
    const text = await readFile(file, "utf8");
    if (/\b(TODO|FIXME|XXX)\b/.test(text)) hits.push(file.replace(root, "."));
  }
  if (hits.length) fail("no todo markers", hits.join(", "));
  else ok("no todo markers");
} catch (e) {
  fail("no todo markers", e.message);
}

// 5. Tistory tokens and <s_*> tags survive the build byte-identical.
const TOKEN = /\[##_[a-zA-Z0-9_-]+_##\]/g;
const STAG = /<\/?s_[a-zA-Z0-9_]+/g;
try {
  const src = await readFile(join(root, "src", "skin.html"), "utf8");
  let dist;
  try {
    dist = await readFile(join(root, "dist", "skin.html"), "utf8");
  } catch {
    dist = null;
  }
  if (dist === null) {
    ran.push("token preservation (skipped: no dist, run npm run build)");
  } else {
    const count = (text, re) => {
      const m = text.match(re) ?? [];
      const out = new Map();
      for (const x of m) out.set(x, (out.get(x) ?? 0) + 1);
      return out;
    };
    const diff = (a, b, kind) => {
      const bad = [];
      for (const [k, v] of a) if ((b.get(k) ?? 0) !== v) bad.push(`${kind} ${k}`);
      for (const k of b.keys()) if (!a.has(k)) bad.push(`${kind} ${k} (extra)`);
      return bad;
    };
    const problems = [
      ...diff(count(src, TOKEN), count(dist, TOKEN), "token"),
      ...diff(count(src, STAG), count(dist, STAG), "tag"),
    ];
    if (problems.length) fail("token preservation", problems.slice(0, 5).join(", "));
    else ok("token preservation");
  }
} catch (e) {
  fail("token preservation", e.message);
}

// 6. index.xml is well-formed (tag balance, CDATA aware).
try {
  const xml = await readFile(join(root, "src", "index.xml"), "utf8");
  const stripped = xml
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?[\s\S]*?\?>/g, "");
  const stack = [];
  let bad = null;
  for (const m of stripped.matchAll(/<(\/?)([a-zA-Z0-9_:-]+)[^>]*?(\/?)>/g)) {
    const [, closing, name, selfClose] = m;
    if (selfClose) continue;
    if (closing) {
      if (stack.pop() !== name) { bad = `unbalanced </${name}>`; break; }
    } else stack.push(name);
  }
  if (!bad && stack.length) bad = `unclosed <${stack[stack.length - 1]}>`;
  if (bad) fail("index.xml well-formed", bad);
  else ok("index.xml well-formed");
} catch (e) {
  fail("index.xml well-formed", e.message);
}

// 7. No duplicate static HTML ids in skin.html (ids containing a token are
//    generated per item by Tistory and are excluded).
try {
  const src = await readFile(join(root, "src", "skin.html"), "utf8");
  const seen = new Map();
  for (const m of src.matchAll(/\sid="([^"]+)"/g)) {
    const id = m[1];
    if (id.includes("[##_")) continue;
    seen.set(id, (seen.get(id) ?? 0) + 1);
  }
  const dupes = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
  if (dupes.length) fail("no duplicate ids", dupes.join(", "));
  else ok("no duplicate ids");
} catch (e) {
  fail("no duplicate ids", e.message);
}

// 8. index.xml uses only elements the official skin guide documents. Tistory
//    rejects the whole file for an unknown element, so catch it here instead.
const XML_ELEMENTS = new Set([
  "skin", "information", "name", "version", "description", "license",
  "author", "homepage", "email",
  "default", "recentEntries", "recentComments", "recentTrackbacks",
  "itemsOnGuestbook", "tagsInCloud", "sortInCloud", "expandComment",
  "expandTrackback", "lengthOfRecentNotice", "lengthOfRecentEntry",
  "lengthOfRecentComment", "lengthOfRecentTrackback", "lengthOfLink",
  "showListOnCategory", "showListOnArchive", "commentMessage",
  "trackbackMessage", "none", "single", "tree", "color", "bgColor",
  "activeColor", "activeBgColor", "labelLength", "showValue", "contentWidth",
  "cover", "item", "label",
  "variables", "variablegroup", "variable", "type", "option",
]);
try {
  const xml = await readFile(join(root, "src", "index.xml"), "utf8");
  const stripped = xml
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?[\s\S]*?\?>/g, "");
  const unknown = new Set();
  for (const m of stripped.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)/g)) {
    if (!XML_ELEMENTS.has(m[1])) unknown.add(m[1]);
  }
  if (unknown.size) fail("index.xml known elements", `unknown ${[...unknown].join(", ")}`);
  else ok("index.xml known elements");
} catch (e) {
  fail("index.xml known elements", e.message);
}

// Report.
if (!ran.length) {
  console.log("skipped: no applicable checks");
  process.exit(0);
}
console.log(`ran ${ran.length} checks: ${ran.join(", ")}`);
if (failures.length) {
  console.error(`\nFAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("passed");
