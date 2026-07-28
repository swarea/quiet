// Build the mock preview (0.1.0). Assembles Nunjucks views with fixture data,
// bundles TS with esbuild, and minifies CSS with Lightning CSS.
// The real Tistory package (dist/skin.html, index.xml) arrives in 0.2.0.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import esbuild from "esbuild";
import { transform } from "lightningcss";
import nunjucks from "nunjucks";
import { buildFont } from "./font.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "preview", "dist");

const serve = process.argv.includes("--serve");

// Order matters: tokens first, then base, then component layers.
const STYLE_ORDER = ["tokens", "base", "layout", "home", "article", "states", "tistory", "content"];
const distDir = join(root, "dist");

// Without explicit targets Lightning CSS emits modern media range syntax
// (`width<=960px`), which Safari below 16.4 and Chrome below 104 ignore
// outright — every responsive rule would silently stop applying there.
// Encoding is major << 16 | minor << 8 | patch.
const TARGETS = {
  chrome: 100 << 16,
  edge: 100 << 16,
  firefox: 100 << 16,
  safari: 15 << 16,
  ios_saf: 15 << 16,
  samsung: 16 << 16,
};

async function buildCss() {
  const parts = [];
  for (const name of STYLE_ORDER) {
    parts.push(await readFile(join(root, "src", "styles", `${name}.css`), "utf8"));
  }
  const { code } = transform({
    filename: "styles.css",
    code: Buffer.from(parts.join("\n")),
    minify: true,
    targets: TARGETS,
  });
  return code;
}

async function buildJs() {
  const result = await esbuild.build({
    entryPoints: [join(root, "src", "scripts", "main.ts")],
    bundle: true,
    minify: true,
    format: "iife",
    target: ["es2020"],
    write: false,
  });
  return result.outputFiles[0].text;
}

async function buildHtml() {
  const { site, pages } = await import(
    `../preview/fixtures.mjs?${Date.now()}`
  );
  const env = nunjucks.configure(join(root, "src", "templates"), {
    autoescape: true,
    noCache: true,
  });
  env.addGlobal("site", site);
  const files = [];
  for (const page of pages) {
    const html = env.render(page.view, { title: page.title, ...page.data });
    files.push({ name: `${page.name}.html`, content: html });
  }
  return files;
}

async function build() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const [css, js, htmlFiles] = await Promise.all([buildCss(), buildJs(), buildHtml()]);
  await writeFile(join(outDir, "styles.css"), css);
  await writeFile(join(outDir, "app.js"), js);
  // The stylesheet asks for images/quiet-latin.woff2 relative to itself, so the
  // preview needs the same shape or it silently falls back to a system font and
  // stops previewing the typeface it exists to preview.
  await mkdir(join(outDir, "images"), { recursive: true });
  await writeFile(join(outDir, "images", "quiet-latin.woff2"), (await buildFont()).data);
  for (const f of htmlFiles) await writeFile(join(outDir, f.name), f.content);

  const list = (await readdir(outDir)).sort();
  console.log(`built ${list.length} files → preview/dist`);
  for (const f of list) console.log(`  ${f}`);
}

// The installable Tistory package. skin.html and index.xml are copied
// byte-identical so no substitution token or <s_*> tag can be altered.
async function buildSkinPackage() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(join(distDir, "images"), { recursive: true });

  const [css, js] = await Promise.all([buildCss(), buildJs()]);
  const skin = await readFile(join(root, "src", "skin.html"));
  const indexXml = await readFile(join(root, "src", "index.xml"));

  await writeFile(join(distDir, "skin.html"), skin);
  await writeFile(join(distDir, "index.xml"), indexXml);
  await writeFile(join(distDir, "style.css"), css);
  await writeFile(join(distDir, "images", "app.js"), js);

  // The Latin half of the typeface, cut from the full variable font so the
  // design does not rest on a third party staying up. See scripts/font.mjs.
  const font = await buildFont();
  await writeFile(join(distDir, "images", "quiet-latin.woff2"), font.data);
  await writeFile(
    join(distDir, "images", "OFL.txt"),
    await readFile(join(root, "src", "fonts", "OFL.txt")),
  );

  // Static assets (preview thumbnails, icons) ship alongside. Generate the
  // previews once with scripts/make-previews.html and drop them in src/assets.
  const assetDir = join(root, "src", "assets");
  const copied = [];
  try {
    for (const entry of await readdir(assetDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue; // a directory here would abort the loop
      if (entry.name.endsWith(".md")) continue; // notes for maintainers
      await writeFile(join(distDir, entry.name), await readFile(join(assetDir, entry.name)));
      copied.push(entry.name);
    }
  } catch {
    /* no assets yet */
  }

  console.log("built tistory package → dist");
  for (const f of ["skin.html", "index.xml", "style.css", "images/app.js", "images/quiet-latin.woff2", ...copied]) {
    console.log(`  ${f}`);
  }
  const previews = ["preview256.jpg", "preview560.jpg", "preview1600.jpg"];
  const missing = previews.filter((p) => !copied.includes(p));
  if (missing.length) {
    console.log(`  note: no ${missing.join(", ")} — open scripts/make-previews.html to generate`);
  }
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

async function startServer() {
  const port = 4321;
  createServer(async (req, res) => {
    let path = decodeURIComponent((req.url || "/").split("?")[0]);
    if (path === "/") path = "/index.html";
    const ext = path.slice(path.lastIndexOf("."));
    try {
      const buf = await readFile(join(outDir, path));
      res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
      res.end(buf);
    } catch {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
    }
  }).listen(port, () => {
    console.log(`preview at http://localhost:${port}/  (index, list, article)`);
  });
}

await build();
await buildSkinPackage();
if (serve) await startServer();
