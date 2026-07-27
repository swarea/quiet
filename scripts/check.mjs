// Single validation gate. Local and CI call this same file.
// Honest by design: reports exactly which checks ran, and never prints a false
// "passed". Exit code is non-zero if any check fails.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile, readdir, stat } from "node:fs/promises";
import esbuild from "esbuild";
import { transform } from "lightningcss";
import { readTheme, parseColour, contrast } from "./theme.mjs";

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
  const files = ["tokens", "base", "layout", "home", "article", "states", "tistory", "content"];
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

// 9. Every skin variable declared in index.xml is actually used by skin.html.
//    A setting that renders a toggle but changes nothing is worse than no
//    setting, and it is invisible until someone flips it on a live blog.
try {
  const xml = await readFile(join(root, "src", "index.xml"), "utf8");
  const skin = await readFile(join(root, "src", "skin.html"), "utf8");
  const varsBlock = xml.match(/<variables>[\s\S]*?<\/variables>/)?.[0] ?? "";
  const declared = [...varsBlock.matchAll(/<name>([^<]+)<\/name>/g)].map((m) => m[1].trim());
  const unused = declared.filter((name) => {
    const uses = [`[##_var_${name}_##]`, `<s_if_var_${name}>`, `<s_not_var_${name}>`];
    return !uses.some((u) => skin.includes(u));
  });
  if (unused.length) fail("skin variables used", `declared but unused: ${unused.join(", ")}`);
  else ok("skin variables used");
} catch (e) {
  fail("skin variables used", e.message);
}

// 10. Compiled CSS stays readable to the browsers we support.
//     Without targets Lightning CSS emits `width<=960px`, which Safari below
//     16.4 ignores outright, silently disabling every responsive rule. And a
//     declaration whose only value is color-mix() is dropped whole by browsers
//     without support, so each one needs a plain value ahead of it.
try {
  const css = await readFile(join(root, "dist", "style.css"), "utf8").catch(() => null);
  if (css === null) {
    ran.push("css browser support (skipped: no dist, run npm run build)");
  } else {
    const problems = [];
    const modernRange = css.match(/@media\s*\([a-z-]*width\s*[<>]=?/g);
    if (modernRange) problems.push(`modern media range syntax (${modernRange.length}x)`);

    // Every rule containing color-mix must declare the same property twice.
    for (const rule of css.match(/[^{}]*\{[^{}]*color-mix[^{}]*\}/g) ?? []) {
      const body = rule.slice(rule.indexOf("{") + 1, -1);
      const props = body.split(";").filter(Boolean).map((d) => d.split(":")[0].trim());
      const mixed = body
        .split(";")
        .filter((d) => d.includes("color-mix"))
        .map((d) => d.split(":")[0].trim());
      for (const p of mixed) {
        if (props.filter((x) => x === p).length < 2) {
          problems.push(`color-mix without fallback: ${p} in ${rule.slice(0, 40)}`);
        }
      }
    }
    if (problems.length) fail("css browser support", problems.slice(0, 4).join("; "));
    else ok("css browser support");
  }
} catch (e) {
  fail("css browser support", e.message);
}

// Reader-facing copy is English. Tistory's own controls are relabelled at
// runtime, so the only Korean allowed in what we author is the relabel table
// that translates them and the slug regex that handles Korean headings.
try {
  const HANGUL = /[가-힣]/;
  const strip = (text) =>
    text.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const offenders = [];
  const scan = (label, text) => {
    for (const line of strip(text).split("\n")) {
      if (HANGUL.test(line)) offenders.push(`${label}: ${line.trim().slice(0, 44)}`);
    }
  };
  scan("skin.html", await readFile(join(root, "src", "skin.html"), "utf8"));
  const moduleDir = join(root, "src", "scripts", "modules");
  for (const entry of await readdir(moduleDir)) {
    // relabel.ts holds the Korean it translates away; toc.ts slugs Korean headings.
    if (entry === "relabel.ts" || entry === "toc.ts") continue;
    scan(entry, await readFile(join(moduleDir, entry), "utf8"));
  }
  if (offenders.length) fail("copy is english", offenders.slice(0, 3).join("; "));
  else ok("copy is english");
} catch (e) {
  fail("copy is english", e.message);
}

// One version. A skin whose package and manifest disagree ships a lie to
// whoever is deciding whether to upgrade.
try {
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const xml = await readFile(join(root, "src", "index.xml"), "utf8");
  const declared = xml.match(/<version>([^<]+)<\/version>/)?.[1]?.trim();
  if (!declared) fail("one version", "index.xml declares no <version>");
  else if (declared !== pkg.version) {
    fail("one version", `package.json ${pkg.version} but index.xml ${declared}`);
  } else ok("one version");
} catch (e) {
  fail("one version", e.message);
}

// Nothing reader-facing or contributor-facing may depend on a link that expires
// or that points at a tool used to build this, rather than at the work itself.
try {
  const offenders = [];
  for (const file of await walk(join(root, "docs"))) {
    if (!file.endsWith(".md")) continue;
    const body = await readFile(file, "utf8");
    for (const m of body.matchAll(/https?:\/\/[^\s<>)\]]+/g)) {
      if (/claude\.(ai|site|com)|chatgpt\.com|openai\.com\/share/.test(m[0])) {
        offenders.push(`${file.split(/[\/]/).pop()}: ${m[0].slice(0, 46)}`);
      }
    }
  }
  if (offenders.length) fail("no ephemeral links", offenders.slice(0, 3).join("; "));
  else ok("no ephemeral links");
} catch (e) {
  fail("no ephemeral links", e.message);
}

// Every role must be bound in both themes. The bindings are the one part of the
// token sheet that is written more than once, because an explicit toggle has to
// beat the operating system's preference in both directions and CSS gives no
// way to say that in a single rule. A role bound in one place and forgotten in
// another is exactly how --ccl-filter went missing from the light toggle.
try {
  const theme = await readTheme();
  const problems = [];
  const lightRoles = new Set(Object.keys(theme.bindings.light ?? {}));
  if (!lightRoles.size) problems.push("no light bindings found");
  for (const block of theme.bindings.dark) {
    const darkRoles = new Set(Object.keys(block.map));
    for (const role of lightRoles) if (!darkRoles.has(role)) problems.push(`${block.selector} never binds ${role}`);
    for (const role of darkRoles) if (!lightRoles.has(role)) problems.push(`${role} is bound only in ${block.selector}`);
  }
  for (const [role, ref] of Object.entries({ ...(theme.bindings.light ?? {}) })) {
    if (theme.palette[ref] === undefined) problems.push(`${role} points at ${ref}, which no palette defines`);
  }
  if (problems.length) fail("theme bindings", problems.slice(0, 3).join("; "));
  else ok("theme bindings");
} catch (e) {
  fail("theme bindings", e.message);
}

// Colours that meet on screen must stay apart in both themes. White on the
// accent measured 2.37 in dark and shipped in 0.2.0; nothing here was watching.
// The pairs are listed rather than discovered, because only the design knows
// which foreground is ever laid on which ground.
const PAIRS = [
  ["--ink", "--paper"], ["--ink", "--surface"], ["--ink", "--surface-2"],
  ["--ink-2", "--paper"], ["--ink-2", "--surface"],
  ["--muted", "--paper"], ["--muted", "--surface"], ["--muted", "--surface-2"],
  ["--faint", "--paper"], ["--faint", "--surface"],
  ["--accent", "--paper"], ["--accent", "--surface"], ["--accent", "--accent-wash"],
  ["--on-accent", "--accent"],
  ["--warm", "--paper"],
];
const AA = 4.5;
try {
  const theme = await readTheme();
  const failures = [];
  for (const [fg, bg] of PAIRS) {
    for (const mode of ["light", "dark"]) {
      const a = parseColour(theme[mode][fg]);
      const b = parseColour(theme[mode][bg]);
      if (!a || !b) { failures.push(`${mode}: ${fg} or ${bg} is not a colour`); continue; }
      const ratio = contrast(a, b);
      if (ratio < AA) failures.push(`${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}, needs ${AA}`);
    }
  }
  if (failures.length) fail("colour contrast", failures.slice(0, 3).join("; "));
  else ok("colour contrast");
} catch (e) {
  fail("colour contrast", e.message);
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
