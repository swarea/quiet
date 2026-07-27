// Rescue post text whose colour was written into the post itself.
//
// The Tistory editor keeps colour on the element, either as an inline `color`
// or as a legacy `<font color>`, and pasting from another site brings whole
// paragraphs in already coloured. Those colours were chosen against whatever
// background the author had at the time. They do not follow a theme, so a grey
// picked for a white page can arrive on a dark one and sink into it.
//
// Only genuinely unreadable text is touched. A colour the author chose that a
// reader can still read is the author's decision and is left exactly as it is;
// this steps in at the point where the words stop being words. The original is
// kept on the element, so switching back to the theme the colour suits puts it
// straight back.

const THRESHOLD = 4.5; // WCAG AA for body text
const ORIGINAL = "quietInk";

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
  // Fully transparent text is not a contrast problem, it is a different one.
  if (parts.length > 3 && parts[3] === 0) return null;
  return parts.slice(0, 3);
}

function contrast(a: number[], b: number[]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// What the text sits on.
//
// Measured on the page, every ancestor of a paragraph is transparent up to
// <body>, so the answer is the page's ground either way. It is read from the
// token rather than from the painted background on purpose: the token is the
// definition and changes with the theme the instant the attribute does, while a
// painted colour is the result of that change and can still be the old one when
// the question is asked. Reading the result is how this judgement came to be
// made against a light page after the reader had switched to a dark one.
//
// A box the author gave a background of its own is a different matter, so a
// painting ancestor below <body> is still believed.
function backdrop(el: HTMLElement): number[] {
  let node: HTMLElement | null = el;
  while (node && node !== document.body && node !== document.documentElement) {
    const rgb = parse(getComputedStyle(node).backgroundColor);
    if (rgb) return rgb;
    node = node.parentElement;
  }
  const ground = getComputedStyle(document.documentElement).getPropertyValue("--paper");
  return parse(ground) ?? parse(getComputedStyle(document.body).backgroundColor) ?? [255, 255, 255];
}

function coloured(root: ParentNode): HTMLElement[] {
  const inline = [...root.querySelectorAll<HTMLElement>("[style]")].filter((el) =>
    /(^|;)\s*color\s*:/i.test(el.getAttribute("style") ?? ""),
  );
  const legacy = [...root.querySelectorAll<HTMLElement>("font[color]")];
  return [...inline, ...legacy];
}

export function initInk(): void {
  const body = document.querySelector<HTMLElement>(".quiet-article-body");
  if (!body) return;
  const targets = coloured(body);
  if (!targets.length) return;

  const apply = (): void => {
    targets.forEach((el) => {
      if (el.dataset[ORIGINAL] === undefined) {
        el.dataset[ORIGINAL] = el.style.color || el.getAttribute("color") || "";
      }
      const original = el.dataset[ORIGINAL] as string;

      // Measure the author's colour, not whatever we last left behind.
      el.style.color = original;
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
