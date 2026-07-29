// Reconcile the colours an author wrote into a post with the theme it is read in.
//
// The Tistory editor keeps colour on the element -- an inline `color` or
// `background-color`, or a legacy `<font color>` -- and pasting from another
// site brings whole paragraphs, callout boxes and code blocks in already
// painted. Those colours were chosen against whatever page the author had at
// the time. They do not follow a theme, so a box painted #f9f9f9 stays white on
// a dark page, and the words inside it that carry no colour of their own
// inherit the theme's light ink and disappear into it.
//
// Text and the ground under it are one decision, so they are settled together
// and in that order: what counts as readable text depends on what it sits on.
// Settling the ground is usually enough on its own, because text with no colour
// of its own then inherits an ink the theme already made right.
//
// Most of what arrives painted was never a decision at all. Across this blog's
// posts, more than a thousand paragraphs, headings and spans carry
// `background-color:#ffffff` -- the paper of whatever page they were copied
// from, attached to every element on the way out. Beside them sit a handful of
// real callout boxes. Both are the same declaration; what separates them is
// whether the author built anything around it.
//
// Only what has stopped working is touched. A colour that still reads where it
// landed is the author's and is left exactly as it is. Every original is kept on
// the element, so switching back to the theme it suits restores it exactly.

const THRESHOLD = 4.5; // WCAG AA for body text
const INK = "quietInk";
const GROUND = "quietGround";

// At or below this saturation the author was not choosing a colour, they were
// choosing "paper, one shade off". The theme has its own answer to that.
const NEUTRAL = 0.12;
// Between these bounds a tint reads on either ground, so it is left alone.
const LIGHT = 0.62;
const DARK = 0.38;

// Did the author build a box here, or is this paint that came along for the
// ride? Both arrive as the same declaration, and telling them apart is the whole
// of the judgement, so it is made on what else the author asked for: a callout
// is declared as a box -- padding, a border, a radius -- and its background is
// part of that box. A run of prose that arrived carrying
// `background-color:#ffffff` built nothing. That was the paper of the page it
// was copied from, and it has no business being painted onto this one.
//
// Read from the author's own declaration rather than from the computed value,
// because the stylesheet gives padding and borders to elements the author never
// touched. `border-collapse` and `border-spacing` are table plumbing, not a box.
const BOX = /(^|;)\s*(padding|border(?!-collapse|-spacing)|box-shadow)[-a-z]*\s*:/i;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance([r, g, b]: number[]): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function parse(colour: string): number[] | null {
  const hex = colour.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const m = colour.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(/[,\s/]+/).map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return null;
  // Fully transparent is not a contrast problem, it is a different one.
  if (parts.length > 3 && parts[3] === 0) return null;
  return parts.slice(0, 3);
}

function contrast(a: number[], b: number[]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Lightness, which is the axis a tint is read along. Luminance answers a
// different question -- how much light comes off it -- and puts a saturated
// yellow on the same side of the scale as white.
function toHsl([r, g, b]: number[]): number[] {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return [h / 6, s, l];
}

function toRgb([h, s, l]: number[]): number[] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const at = (t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [at(h + 1 / 3), at(h), at(h - 1 / 3)].map((v) => Math.round(v * 255));
}

// Read from the token rather than from a painted pixel. The token is the
// definition and changes with the theme the instant the attribute does, while a
// painted colour is the result of that change and can still be the old one when
// the question is asked.
function token(name: string): number[] | null {
  return parse(getComputedStyle(document.documentElement).getPropertyValue(name));
}

function paper(): number[] {
  return token("--paper") ?? parse(getComputedStyle(document.body).backgroundColor) ?? [255, 255, 255];
}

// A ground the author painted, moved to the side of the scale the page is on.
// Null means it already belongs there, which is the common case and the one
// where leaving it alone is the entire point.
function retone(ground: number[], pageIsDark: boolean, isBox: boolean): string | null {
  const [h, s, l] = toHsl(ground);
  if (pageIsDark ? l < LIGHT : l > DARK) return null;
  if (s <= NEUTRAL) {
    // Carried paper is removed rather than translated. Turning it into this
    // theme's paper would be just as wrong: the page already paints the ground,
    // and repainting it per-paragraph only tiles the article with rectangles
    // that happen to be a different colour than before.
    if (!isBox) return "transparent";
    const surface = token("--surface-2");
    return surface ? `rgb(${surface.join(",")})` : null;
  }
  // Keep the hue and the strength the author picked; move only how light it is,
  // and only as far as a tint on this ground can go.
  const moved = pageIsDark
    ? Math.min(Math.max(1 - l, 0.13), 0.28)
    : Math.min(Math.max(1 - l, 0.82), 0.94);
  return `rgb(${toRgb([h, s, moved]).join(",")})`;
}

// What the text sits on.
//
// Measured on the page, every ancestor of a plain paragraph is transparent up
// to <body>, so the answer is the page's ground either way. A box the author
// gave a background of its own is a different matter, so a painting ancestor
// below <body> is still believed -- by this point that background has already
// been moved onto the right side of the scale, which is why grounds are settled
// first.
function backdrop(el: HTMLElement): number[] {
  let node: HTMLElement | null = el;
  while (node && node !== document.body && node !== document.documentElement) {
    const rgb = parse(getComputedStyle(node).backgroundColor);
    if (rgb) return rgb;
    node = node.parentElement;
  }
  return paper();
}

function styled(root: ParentNode, property: RegExp): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>("[style]")].filter((el) =>
    property.test(el.getAttribute("style") ?? ""),
  );
}

export function initInk(): void {
  const body = document.querySelector<HTMLElement>(".quiet-article-body");
  if (!body) return;

  // The code frame is ours in both themes and the stylesheet already restates it
  // above anything a paste can carry, so a <pre> is left to that rule; joining in
  // here would only be a second opinion on a question already answered.
  const painted = [
    ...styled(body, /(^|;)\s*background(-color)?\s*:/i),
    ...body.querySelectorAll<HTMLElement>("[bgcolor]"),
  ].filter((el) => !el.closest("pre"));

  const inked = [
    ...styled(body, /(^|;)\s*color\s*:/i),
    ...body.querySelectorAll<HTMLElement>("font[color]"),
  ];

  if (!painted.length && !inked.length) return;

  const apply = (): void => {
    const pageIsDark = toHsl(paper())[2] < 0.5;

    painted.forEach((el) => {
      if (el.dataset[GROUND] === undefined) el.dataset[GROUND] = el.style.backgroundColor;
      // Measure the author's ground, not whatever we last left behind.
      el.style.backgroundColor = el.dataset[GROUND] as string;
      const ground = parse(getComputedStyle(el).backgroundColor);
      if (!ground) return;
      const moved = retone(ground, pageIsDark, BOX.test(el.getAttribute("style") ?? ""));
      if (moved) el.style.backgroundColor = moved;
    });

    inked.forEach((el) => {
      if (el.dataset[INK] === undefined) {
        el.dataset[INK] = el.style.color || el.getAttribute("color") || "";
      }
      el.style.color = el.dataset[INK] as string;
      const ink = parse(getComputedStyle(el).color);
      if (!ink) return;
      if (contrast(ink, backdrop(el)) < THRESHOLD) el.style.color = "inherit";
    });
  };

  apply();

  // The reader can change the theme at any time, and a colour that was fine a
  // moment ago may not be now.
  if (typeof MutationObserver === "undefined") return;
  new MutationObserver(apply).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}
