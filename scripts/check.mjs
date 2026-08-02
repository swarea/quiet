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
const skipped = [];
function ok(name) { ran.push(name); }
function skip(name, why) { skipped.push(`${name} (${why})`); }
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
    skip("token preservation", "no dist, run npm run build");
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
    skip("css browser support", "no dist, run npm run build");
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
    // relabel.ts holds the Korean it translates away; toc.ts slugs Korean
    // headings; lang.ts names the Hangul range to recognise it. None of these
    // is copy a reader sees.
    if (entry === "relabel.ts" || entry === "toc.ts" || entry === "lang.ts") continue;
    scan(entry, await readFile(join(moduleDir, entry), "utf8"));
  }
  if (offenders.length) fail("copy is english", offenders.slice(0, 3).join("; "));
  else ok("copy is english");
} catch (e) {
  fail("copy is english", e.message);
}

// A field is called one thing, not two.
//
// Every text field here is labelled twice: a visually hidden <label> that is the
// only thing a screen reader reads, and a placeholder that is the only thing a
// sighted reader sees. Nothing keeps them in step, and they had drifted -- the
// comment box announced "Write a comment" and displayed "Leave a comment", the
// guestbook announced an "entry" and asked for a "message". Someone driving the
// page by voice says what they can see, which was never what the field was
// called. The mock templates carry their own copy of the same markup, so the
// two can also drift from each other; both are scanned.
try {
  const pairs = (text) => {
    const labels = new Map();
    for (const m of text.matchAll(/<label[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/label>/g)) {
      labels.set(m[1], m[2].replace(/<[^>]*>/g, "").trim());
    }
    const out = [];
    for (const m of text.matchAll(/<(?:input|textarea)\b[^>]*>/g)) {
      const id = /\bid="([^"]+)"/.exec(m[0])?.[1];
      const ph = /\bplaceholder="([^"]*)"/.exec(m[0])?.[1];
      if (id && ph && labels.has(id)) out.push([id, labels.get(id), ph]);
    }
    return out;
  };
  const offenders = [];
  let seen = 0;
  const files = ["src/skin.html"];
  for (const entry of await readdir(join(root, "src", "templates", "views"))) {
    files.push(`src/templates/views/${entry}`);
  }
  for (const file of files) {
    for (const [id, label, ph] of pairs(await readFile(join(root, file), "utf8"))) {
      seen++;
      if (label !== ph) offenders.push(`${file} #${id}: "${label}" vs "${ph}"`);
    }
  }
  if (!seen) fail("a field is called one thing", "no labelled field found to check");
  else if (offenders.length) fail("a field is called one thing", offenders.slice(0, 3).join("; "));
  else ok("a field is called one thing");
} catch (e) {
  fail("a field is called one thing", e.message);
}

// The licence travels with the copies.
//
// MIT asks for the copyright and permission notice in "all copies or
// substantial portions of the Software", which is the files rather than the page
// they render. A blogger's upload is a copy and Tistory serves the stylesheet
// and the bundle to every reader verbatim, so the notice has to survive the
// build -- a minifier that drops comments would take it out silently. The
// package shipped the font's OFL licence, because that licence demands it, and
// none of its own.
//
// The visible credit in the sidebar is a different thing and is not checked
// here: MIT does not ask for attribution in a running product.
try {
  const holder = (await readFile(join(root, "LICENSE"), "utf8")).match(
    /Copyright \(c\) (\d{4}) (.+)/,
  );
  const missing = [];
  if (!holder) missing.push("LICENSE has no copyright line");
  else {
    for (const file of ["style.css", "images/app.js"]) {
      const text = await readFile(join(root, "dist", ...file.split("/")), "utf8").catch(() => null);
      if (text === null) missing.push(`${file} not built`);
      else if (!text.includes(`Copyright (c) ${holder[1]} ${holder[2].trim()}`)) {
        missing.push(`${file} carries no copyright notice`);
      }
    }
    const shipped = await readFile(join(root, "dist", "images", "LICENSE.txt"), "utf8").catch(() => null);
    if (shipped === null) missing.push("images/LICENSE.txt is not in the package");
    else if (!shipped.includes("Copyright (c)")) missing.push("images/LICENSE.txt is not the licence");
  }
  if (missing.length) fail("the licence travels with the copies", missing.join("; "));
  else ok("the licence travels with the copies");
} catch (e) {
  fail("the licence travels with the copies", e.message);
}

// Correcting the page does not wait for a frame.
//
// A hidden tab never has one. `requestAnimationFrame` is right for something
// being drawn -- a transition to release, a scroll position to read -- and wrong
// for something being corrected, because the correction then never happens until
// the reader looks at the tab. It cost us Tistory's Korean sitting in the article
// toolbar of any post opened in a background tab: measured on a live post with
// the tab hidden, the bar still read 구독하기 long after boot and no frame had run.
//
// A MutationObserver is the tell. It fires because the DOM changed, which is a
// correction, so a frame inside one is this bug. Frames elsewhere are left alone.
try {
  const dir = join(root, "src", "scripts", "modules");
  const offenders = [];
  for (const entry of await readdir(dir)) {
    const src = await readFile(join(dir, entry), "utf8");
    let at = 0;
    for (;;) {
      const start = src.indexOf("new MutationObserver(", at);
      if (start < 0) break;
      let depth = 0;
      let i = src.indexOf("(", start);
      const from = i;
      for (; i < src.length; i++) {
        if (src[i] === "(") depth++;
        else if (src[i] === ")" && --depth === 0) break;
      }
      const body = src.slice(from, i);
      if (body.includes("requestAnimationFrame")) {
        offenders.push(`${entry}: a frame gates a MutationObserver callback`);
      }
      at = i;
    }
  }
  if (offenders.length) fail("correcting does not wait for a frame", offenders.join("; "));
  else ok("correcting does not wait for a frame");
} catch (e) {
  fail("correcting does not wait for a frame", e.message);
}

// Anything the stylesheet holds back has three ways to be let go.
//
// The labels Tistory writes are hidden until the bundle can reword them, which
// is only safe while every exit is open: the bundle setting `data-quiet-ready`
// when it boots, the `load` handler dropping `quiet-js` when it never arrives,
// and `quiet-js` never being set at all when scripting is off. Lose any one of
// them and a reader is left looking at a blank where a label should be, with
// nothing on the page able to bring it back. The markers live in three files
// that have no reason to be edited together, so the tie is asserted here.
try {
  const css = await readFile(join(root, "dist", "style.css"), "utf8").catch(() => null);
  if (!css) skip("a held label can be let go", "dist/style.css not built");
  else if (!css.includes("[data-quiet-ready]")) ok("a held label can be let go");
  else {
    const skin = await readFile(join(root, "src", "skin.html"), "utf8");
    const main = await readFile(join(root, "src", "scripts", "main.ts"), "utf8");
    const missing = [];
    if (!/setAttribute\(\s*["']data-quiet-ready["']/.test(main)) {
      missing.push("main.ts never sets data-quiet-ready");
    }
    if (!/addEventListener\(\s*["']load["'][\s\S]{0,400}?classList\.remove\(\s*["']quiet-js["']/.test(skin)) {
      missing.push("skin.html has no load handler dropping quiet-js");
    }
    if (!/classList\.add\(\s*["']quiet-js["']/.test(skin)) {
      missing.push("skin.html never sets quiet-js");
    }
    // A hold keyed on a marker nobody sets never lifts, and the two kinds of
    // marker are set in different places. One arms a hold and has to be there
    // before the first paint, so it comes from the inline script in <head>. The
    // other releases one and is written by whichever module finished the work,
    // so it comes from the bundle. Told apart by which side of `:not()` the
    // stylesheet reads them on.
    // Read only the compound bolted onto `:root` -- everything from it up to the
    // first space, which is where a marker can live and where a component class
    // cannot. Scanned as one string rather than by what precedes each dot,
    // because markers sit flush against each other: `.quiet-js.quiet-all-posts`
    // gave up its second half to a rule that wanted a character before the dot.
    const releases = new Set();
    const arms = new Set();
    for (const m of css.matchAll(/:root([^\s,{]*)/g)) {
      const compound = m[1];
      for (const n of compound.matchAll(/:not\(\s*\.(quiet-[a-z-]+)\s*\)/g)) releases.add(n[1]);
      const armed = compound.replace(/:not\([^)]*\)/g, "");
      for (const a of armed.matchAll(/\.(quiet-[a-z-]+)/g)) arms.add(a[1]);
    }
    const bundle = (
      await Promise.all(
        (await readdir(join(root, "src", "scripts", "modules"))).map((f) =>
          readFile(join(root, "src", "scripts", "modules", f), "utf8"),
        ),
      )
    ).join("\n");
    const sets = (text, marker) =>
      new RegExp(`classList\\.add\\(\\s*["']${marker}["']`).test(text);
    for (const marker of arms) {
      if (marker === "quiet-js") continue;
      if (!sets(skin, marker)) missing.push(`<head> never sets .${marker}, which arms a hold`);
    }
    for (const marker of releases) {
      if (!sets(bundle, marker)) missing.push(`no module sets .${marker}, which releases a hold`);
    }
    if (missing.length) fail("a held label can be let go", missing.join("; "));
    else ok("a held label can be let go");
  }
} catch (e) {
  fail("a held label can be let go", e.message);
}

// Every syntax colour on the page must be ours.
//
// Tistory injects highlight.js with the `atom-one-light` theme from a CDN, and
// whatever we do not restate keeps that theme's colour — chosen for a white page
// nobody here designed. It has leaked twice: first the comment colour at 4.01
// against the dark block, then `hljs-selector-class` at 4.22 against the light
// one, found only by sweeping a real post. The contrast gate cannot see these,
// because the colours are not ours and are not in the token sheet.
//
// The list is what `atom-one-light` colours, read from the CDN on 2026-07-30 and
// pinned here rather than fetched: a check that needs the network is a check
// that fails for reasons that have nothing to do with the skin. If Tistory ever
// changes theme this list goes stale, which is worth a re-read then, not a
// network call on every run.
const HLJS_COLOURED = [
  "hljs-comment", "hljs-quote", "hljs-doctag", "hljs-keyword", "hljs-formula",
  "hljs-section", "hljs-name", "hljs-selector-tag", "hljs-deletion", "hljs-subst",
  "hljs-literal", "hljs-string", "hljs-regexp", "hljs-addition", "hljs-attribute",
  "hljs-meta-string", "hljs-built_in", "hljs-attr", "hljs-variable",
  "hljs-template-variable", "hljs-type", "hljs-selector-class", "hljs-selector-attr",
  "hljs-selector-pseudo", "hljs-number", "hljs-symbol", "hljs-bullet", "hljs-link",
  "hljs-meta", "hljs-title", "hljs-function",
];
try {
  const css = await readFile(join(root, "dist", "style.css"), "utf8").catch(() => null);
  if (!css) skip("syntax colours are ours", "dist/style.css not built");
  else {
    const missing = HLJS_COLOURED.filter((cls) => !css.includes(`.${cls}`));
    if (missing.length) fail("syntax colours are ours", `never restated: ${missing.join(", ")}`);
    else ok("syntax colours are ours");
  }
} catch (e) {
  fail("syntax colours are ours", e.message);
}

// Nothing in index.xml is longer than the editor can show.
//
// Tistory gives each of these a fixed strip and does not scroll it. The skin
// description ran to 446 characters and was cut off mid-word; the licence ran to
// 243 and left its panel entirely, printing over the heading below. Both looked
// fine in the file.
//
// 125 is measured rather than chosen. In the skin editor's header panel the
// licence at 121 characters wrapped to two lines and showed in full, while the
// description at 141 wrapped to the same two lines and was cut mid-word at
// roughly 128. The old ceiling of 160 was a guess made before either had been
// seen there, and it passed a string the panel could not show.
//
// Anything that needs more room belongs in the README, which is what the
// homepage link is for.
const XML_TEXT_LIMIT = 125;
try {
  const xml = await readFile(join(root, "src", "index.xml"), "utf8");
  const long = [];
  for (const m of xml.matchAll(/<(description|license)>\s*<!\[CDATA\[([\s\S]*?)\]\]>/g)) {
    const value = m[2].replace(/\s+/g, " ").trim();
    if (value.length > XML_TEXT_LIMIT) {
      long.push(`<${m[1]}> is ${value.length}: "${value.slice(0, 40)}…"`);
    }
  }
  if (long.length) fail("index.xml copy fits", long.slice(0, 3).join("; "));
  else ok("index.xml copy fits");
} catch (e) {
  fail("index.xml copy fits", e.message);
}

// The thumbnail is drawn in the skin's own colours.
//
// `scripts/make-previews.html` is opened from disk and cannot fetch the token
// sheet, so its palette is copied by hand — and a hand-copied palette drifts.
// Both the first generator and a replacement drafted for it had drifted before
// this check existed: lines up to 24 steps darker than the skin's and secondary
// text 32 lighter, which put the picture's own body text below the contrast
// floor the skin holds itself to. A thumbnail is the first thing anyone sees of
// this project, and it was advertising colours it does not use.
try {
  const [generator, tokens] = await Promise.all([
    readFile(join(root, "scripts", "make-previews.html"), "utf8"),
    readFile(join(root, "src", "styles", "tokens.css"), "utf8"),
  ]);
  const real = new Map();
  for (const m of tokens.matchAll(/--light-([a-z0-9-]+)\s*:\s*(#[0-9a-f]{3,8})/gi)) {
    real.set(`--light-${m[1]}`, m[2].toLowerCase());
  }
  const declared = [...generator.matchAll(/"(--light-[a-z0-9-]+)"\s*:\s*"(#[0-9a-f]{3,8})"/gi)];
  const problems = [];
  if (!declared.length) problems.push("no --light-* palette found in the generator");
  for (const [, token, value] of declared) {
    const expected = real.get(token);
    if (expected === undefined) problems.push(`${token} is not in tokens.css`);
    else if (expected !== value.toLowerCase()) problems.push(`${token} is ${value}, tokens.css says ${expected}`);
  }
  if (problems.length) fail("preview palette", problems.slice(0, 3).join("; "));
  else ok("preview palette");
} catch (e) {
  fail("preview palette", e.message);
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

// A class that shares an element with .quiet-wrap inherits the 2rem side inset
// that keeps every section of the page on the same left edge. The `padding`
// shorthand resets that inset whether or not it meant to: `.quiet-recent{padding:
// 2.2rem 0}` set it to zero, and because the featured cover happened to have no
// padding rule at all, three home covers sat 32px left of the fourth. Nothing
// caught it, because each rule was correct about the axis it was thinking about.
// Say the axis.
try {
  const html = await readFile(join(root, "src", "skin.html"), "utf8");
  const templates = await walk(join(root, "src", "templates"));
  const markup = [html, ...(await Promise.all(templates.map((f) => readFile(f, "utf8"))))].join("\n");

  const co = new Set();
  for (const m of markup.matchAll(/class="([^"]*)"/g)) {
    const cls = m[1].split(/\s+/).filter(Boolean);
    if (!cls.includes("quiet-wrap")) continue;
    for (const c of cls) if (c !== "quiet-wrap" && c.startsWith("quiet-")) co.add(c);
  }
  if (!co.size) throw new Error("no class shares an element with quiet-wrap");

  // The subject of a selector is its last compound: `.a .b` styles .b, not .a.
  const subjectIs = (selector, cls) =>
    selector.split(",").some((part) => {
      const compounds = part.trim().split(/[\s>+~]+/).filter(Boolean);
      const last = compounds[compounds.length - 1] ?? "";
      return new RegExp(`\\.${cls}(?![\\w-])`).test(last);
    });

  const offenders = [];
  for (const file of await walk(join(root, "src", "styles"))) {
    const css = (await readFile(file, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const rule of css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
      const [, selector, body] = rule;
      const decl = body.match(/(?:^|;)\s*padding\s*:\s*([^;]+)/);
      if (!decl) continue;
      for (const cls of co) {
        if (!subjectIs(selector, cls)) continue;
        offenders.push(`${file.split(/[/\\]/).pop()}: ${selector.trim()} {padding:${decl[1].trim()}}`);
      }
    }
  }
  if (offenders.length) fail("padding states its axis", offenders.slice(0, 3).join("; "));
  else ok("padding states its axis");
} catch (e) {
  fail("padding states its axis", e.message);
}

// A theme swap has to hold every element transition for its duration, and then
// let go. A property fed by a theme token and given a transition of its own was
// left holding the previous theme's value after the swap and stayed there --
// measured after one toggle, 41 elements across 13 kinds, the category tree
// among them reading 1.70 against its new ground. The failure is silent: the
// page looks fine until someone changes theme, and only then on the elements
// that happen to carry a transition.
//
// Holding it forever is the other half. Waiting on the view transition to finish
// does not work, because in a hidden tab it never does, so the release needs a
// path that does not depend on that promise.
try {
  const css = await readFile(join(root, "src", "styles", "base.css"), "utf8");
  const ts = await readFile(join(root, "src", "scripts", "modules", "theme.ts"), "utf8");
  const problems = [];

  const rule = css.match(/\.quiet-swapping[^{]*\{([^}]*)\}/);
  if (!rule) problems.push("base.css never suppresses transitions during a swap");
  else if (!/transition\s*:\s*none\s*!important/.test(rule[1])) {
    problems.push("the .quiet-swapping rule does not force transition:none");
  }

  if (!/classList\.add\("quiet-swapping"\)/.test(ts)) problems.push("theme.ts never holds the swap");
  if (!/classList\.remove\("quiet-swapping"\)/.test(ts)) problems.push("theme.ts never releases the swap");
  if (!/setTimeout\(/.test(ts)) problems.push("theme.ts has no release that survives a promise never settling");

  if (problems.length) fail("theme swap holds transitions", problems.join("; "));
  else ok("theme swap holds transitions");
} catch (e) {
  fail("theme swap holds transitions", e.message);
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
  ["--nav", "--paper"], ["--nav", "--surface"],
  ["--muted", "--paper"], ["--muted", "--surface"], ["--muted", "--surface-2"],
  ["--faint", "--paper"], ["--faint", "--surface"], ["--faint", "--surface-2"],
  ["--accent", "--paper"], ["--accent", "--surface"], ["--accent", "--accent-wash"],
  ["--on-accent", "--accent"],
  ["--warm", "--paper"],
  ["--code-ink", "--code-bg"], ["--code-ink-2", "--code-bg"], ["--code-faint", "--code-bg"],
  ["--code-comment", "--code-bg"], ["--code-accent", "--code-bg"],
  ["--code-key", "--code-bg"], ["--code-str", "--code-bg"],
  ["--code-fn", "--code-bg"], ["--code-num", "--code-bg"], ["--code-del", "--code-bg"],
  // The bar above the code carries the language and the copy button, and is a
  // shade off the block rather than the same colour.
  ["--code-faint", "--code-bar"], ["--code-ink-2", "--code-bar"], ["--code-ink", "--code-bar"],
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

// The mock preview and the skin are two separate sets of markup sharing one
// stylesheet, and nothing keeps them in step. Eight divergences were found by
// hand in a single day: a class the skin stopped emitting, a heading the mock
// lacked, a label in the wrong language, a font the mock never loaded. Each one
// made a pass in the preview mean less than it appeared to.
//
// The classes below are allowed to differ, for one of two reasons: the skin
// styles markup Tistory generates and the mock cannot produce, or the mock
// carries sample content demonstrating what an author's writing looks like.
// Anything else that appears on one side only is drift, and fails.
// Markup only one side can produce. The skin renders what Tistory generates and
// what its tokens fill; the mock renders its own sidebar and sample content in
// their place. Neither can carry the other's, so neither is drift.
const UNAVOIDABLE_SKIN = new Set([
  "quiet-cat-tistory", "quiet-menu-tistory", "quiet-side-list", "quiet-taglabel",
  "quiet-avatar", "quiet-secret",
  "quiet-notice-row", "quiet-row-plain",
]);
const UNAVOIDABLE_MOCK = new Set([
  "quiet-cat", "quiet-cat-row", "quiet-sub", "quiet-sub-inner", "quiet-menu",
  "quiet-monogram", "quiet-empty", "quiet-tags",
  "quiet-load", "quiet-reveal",
]);

// Drift the mock has not caught up with. Each entry is a place where a pass in
// the preview says less than it appears to, and the list should only shrink.
// Adding to it is how a divergence gets hidden, so it needs a reason each time.
const KNOWN_DRIFT = new Set([
  "quiet-adjacent",  // no previous/next links
  "quiet-colophon",  // no colophon in the mock's rail foot
]);

try {
  const classesIn = (text) =>
    new Set(
      [...text.matchAll(/class="([^"]*)"/g)]
        .flatMap((m) => m[1].split(/\s+/))
        .map((c) => c.split("{")[0])
        .filter((c) => c.startsWith("quiet-")),
    );
  const walk = async (d) => {
    const out = [];
    for (const e of await readdir(d, { withFileTypes: true })) {
      const full = join(d, e.name);
      out.push(...(e.isDirectory() ? await walk(full) : [full]));
    }
    return out;
  };
  const skin = classesIn(await readFile(join(root, "src", "skin.html"), "utf8"));
  const SEP = String.fromCharCode(10);
  const files = await walk(join(root, "src", "templates"));
  const mockText = (await Promise.all(files.map((f) => readFile(f, "utf8")))).join(SEP);
  const mock = classesIn(mockText);

  const drifted = [
    ...[...skin].filter((c) => !mock.has(c) && !UNAVOIDABLE_SKIN.has(c) && !KNOWN_DRIFT.has(c)).map((c) => `${c} (skin only)`),
    ...[...mock].filter((c) => !skin.has(c) && !UNAVOIDABLE_MOCK.has(c)).map((c) => `${c} (mock only)`),
  ].sort();

  if (drifted.length) {
    fail("preview matches skin", `${drifted.length}: ${drifted.slice(0, 4).join(", ")}`);
  } else {
    ok("preview matches skin");
  }
} catch (e) {
  fail("preview matches skin", e.message);
}

// Report.
if (!ran.length) {
  console.log("skipped: no applicable checks");
  process.exit(0);
}
console.log(`ran ${ran.length} checks: ${ran.join(", ")}`);
if (skipped.length) {
  console.log(`skipped ${skipped.length}: ${skipped.join(", ")}`);
}
if (failures.length) {
  console.error(`\nFAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("passed");
