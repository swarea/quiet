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
  const files = ["tokens", "base", "layout", "home", "article", "states"];
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
