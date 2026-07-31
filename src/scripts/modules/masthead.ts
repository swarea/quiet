// Let the opening band's item point somewhere, if the blogger said where.
//
// Every cover item carries a URL field, and every other cover uses it: a row, a
// featured post and a tile are all links. The opening band was the only place
// that took the field and dropped it, so a blogger who filled it in got nothing
// and no reason why -- the same silence the attached image used to get.
//
// It has to be script, and that is a platform limit rather than a preference.
// Tistory documents `<s_cover_url>` for a cover's own url and nothing for an
// item's, so a template cannot ask whether one was set. Writing the anchor
// unconditionally would give every blog that left the field empty an
// `<a href="">` on its headline, which reloads the page when clicked -- a
// working link for the few, a broken one for everyone else.
//
// Without scripting the headline is words, which is exactly what it is today.

const SOURCE = ".quiet-masthead-item[data-quiet-href]";

// Only somewhere a reader can actually go. An empty field is the common case,
// and `javascript:` is not a destination however it arrived in the settings.
function destination(raw: string): string | null {
  const value = raw.trim();
  if (!value || value === "#") return null;
  let url: URL;
  try {
    url = new URL(value, location.href);
  } catch {
    return null;
  }
  return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
}

export function initMasthead(): void {
  for (const item of document.querySelectorAll<HTMLElement>(SOURCE)) {
    const href = destination(item.dataset.quietHref ?? "");
    if (!href) continue;

    const display = item.querySelector<HTMLElement>(".quiet-display");
    if (!display || display.querySelector("a")) continue;
    if (!(display.textContent ?? "").trim()) continue;

    // The headline is the link, not the whole band. A band that answers a click
    // anywhere inside it is a surface, and this one is meant to be read.
    //
    // The nodes already there are moved into the anchor rather than replaced by
    // their text. Reading the text and writing it back looked equivalent and was
    // not: a headline set over two lines lost the break between them, because a
    // line break is a node and text is only what is left when the nodes are
    // thrown away. Nothing is parsed here either way -- the nodes are the ones
    // Tistory already put on the page.
    const link = document.createElement("a");
    link.href = href;
    while (display.firstChild) link.append(display.firstChild);
    display.append(link);
  }
}
