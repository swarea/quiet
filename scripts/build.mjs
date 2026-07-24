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

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "preview", "dist");

const serve = process.argv.includes("--serve");

// Order matters: tokens first, then base, then component layers.
const STYLE_ORDER = ["tokens", "base", "layout", "home", "article", "states"];

async function buildCss() {
  const parts = [];
  for (const name of STYLE_ORDER) {
    parts.push(await readFile(join(root, "src", "styles", `${name}.css`), "utf8"));
  }
  const { code } = transform({
    filename: "styles.css",
    code: Buffer.from(parts.join("\n")),
    minify: true,
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
  for (const f of htmlFiles) await writeFile(join(outDir, f.name), f.content);

  const list = (await readdir(outDir)).sort();
  console.log(`built ${list.length} files → preview/dist`);
  for (const f of list) console.log(`  ${f}`);
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
if (serve) await startServer();
