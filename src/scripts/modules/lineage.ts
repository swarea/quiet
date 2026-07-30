// Say which branch a post's category hangs off.
//
// Tistory's category tokens return a leaf and nothing else -- `Backend`, with no
// way to tell it sits under `Engineering`. The official guide documents a name
// and a URL for every one of them, on the cover, on a list and on an article,
// and no parent or path token anywhere. So the hierarchy exists in exactly one
// place a skin can reach: the category URL, `/category/Engineering/Backend`.
//
// Read from there rather than from the sidebar tree. The tree is a different set
// of links, a blog can turn it off, and it says nothing about any given post.
//
// Without scripting a reader sees the leaf, which is what Tistory sends and is
// never wrong -- only shorter. That is the whole fallback.

const SOURCE = "[data-quiet-cat]";

function ancestry(url: string): string[] {
  let path: string;
  try {
    path = new URL(url, location.href).pathname;
  } catch {
    return [];
  }
  const parts = path
    .split("/")
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    });
  // Anything not shaped like a category listing is not a trail.
  if (parts.shift() !== "category") return [];
  return parts;
}

export function initLineage(): void {
  for (const el of document.querySelectorAll<HTMLElement>(SOURCE)) {
    const parts = ancestry(el.dataset.quietCat ?? "");
    if (parts.length < 2) continue;
    const leaf = parts[parts.length - 1];
    // Only rewrite a label that still reads as the leaf its own URL ends in. A
    // category can be renamed without its URL following, and a label that has
    // parted company with its path is not one to build a trail out of.
    //
    // Compared without case, because a URL is not obliged to carry the name's:
    // a live blog serves /category/Engineering/Backend beside the label
    // "Backend", but the match is a courtesy rather than a rule, and a strict
    // comparison would silently drop the trail wherever it is not kept.
    const same = (a: string, b: string): boolean =>
      a.trim().toLowerCase() === b.trim().toLowerCase();
    if (!same(el.textContent ?? "", leaf)) continue;

    // Built as nodes, never as markup: these names come back off a URL.
    //
    // The separator is a real character rather than a CSS ::after, so that it
    // survives being copied and is spoken. Left to the stylesheet, selecting the
    // label yielded "ProgrammingTypeScript".
    //
    // The leaf keeps the wording Tistory sent rather than the spelling in the
    // URL. Matching them without case is what let this run at all, so writing
    // the path segment back is how "TypeScript" would become "typescript".
    const label = (el.textContent ?? "").trim();
    el.textContent = "";
    for (const name of parts.slice(0, -1)) {
      const up = document.createElement("span");
      up.className = "up";
      up.textContent = name;
      el.append(up, " · ");
    }
    el.append(label);
  }
}
