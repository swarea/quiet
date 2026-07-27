// Read the design tokens the way a browser would, without one.
//
// The stylesheet writes each palette once and then binds roles to it. This
// resolves those bindings so the build can reason about what a reader will
// actually see in either theme, which is the only way to check colour: the
// in-app browser updates the custom properties when the theme changes but not
// the properties that consume them, so anything measured there is measuring the
// wrong thing.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function strip(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

// Every `selector { ... }` at the top level, with @media unwrapped one level so
// the rule inside it is visible too.
function rules(css) {
  const out = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) break;
    const selector = css.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth += 1;
      else if (css[j] === "}") depth -= 1;
      j += 1;
    }
    const body = css.slice(open + 1, j - 1);
    if (selector.startsWith("@media")) out.push(...rules(body).map((r) => ({ ...r, media: selector })));
    else out.push({ selector, body });
    i = j;
  }
  return out;
}

function declarations(body) {
  const out = {};
  for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/gi)) {
    out[m[1].trim()] = m[2].trim();
  }
  return out;
}

export async function readTheme() {
  const css = strip(await readFile(join(root, "src", "styles", "tokens.css"), "utf8"));
  const all = rules(css);

  const palette = {};
  const bindings = { light: null, dark: [] };

  for (const rule of all) {
    const decls = declarations(rule.body);
    for (const [name, value] of Object.entries(decls)) {
      if (/^--(light|dark)-/.test(name)) palette[name] = value;
    }
    // A binding block is one that points roles at a palette.
    const bound = Object.entries(decls).filter(([, v]) => /^var\(--(light|dark)-/.test(v));
    if (!bound.length) continue;
    const map = Object.fromEntries(bound.map(([k, v]) => [k, v.match(/var\((--[a-z0-9-]+)\)/)[1]]));
    const target = bound[0][1].includes("--dark-") ? "dark" : "light";
    if (target === "light") bindings.light = { ...(bindings.light ?? {}), ...map };
    else bindings.dark.push({ selector: rule.media ? `${rule.media} ${rule.selector}` : rule.selector, map });
  }

  const resolve = (map) =>
    Object.fromEntries(Object.entries(map).map(([role, ref]) => [role, palette[ref] ?? null]));

  return {
    palette,
    bindings,
    light: resolve(bindings.light ?? {}),
    dark: resolve(bindings.dark[0]?.map ?? {}),
  };
}

// ---------------------------------------------------------------- colour

export function parseColour(value) {
  if (!value) return null;
  const hex = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!hex) return null;
  const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function channel(v) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function contrast(a, b) {
  const lum = (rgb) => 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
