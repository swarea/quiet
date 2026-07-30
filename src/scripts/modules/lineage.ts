// Say which branch a post's category hangs off, the same way everywhere.
//
// Tistory documents one thing under two tokens and sends two different things.
// Measured on a live blog, on the same post:
//
//   [##_cover_item_category_##]  ->  "Backend"                (커버: 카테고리 명)
//   [##_list_rep_category_##]    ->  "Engineering/Backend"    (목록: 카테고리 이름)
//
// So a reader met the same category twice, written two ways, on two pages of the
// same blog. No token returns a parent or a path in either place -- the guide
// documents a name and a url and nothing else -- and the only other place the
// hierarchy exists is the category url, `/category/Engineering/Backend`.
//
// Read from there rather than from the sidebar tree. The tree is a different set
// of links, a blog can turn it off, and it says nothing about any given post.
//
// Whichever shape arrives, one comes out, written the way the list token
// already writes it: `Engineering/Backend`. Every character of that is
// Tistory's, including the slash. This adds no styling and no markup -- the
// whole string is the category, and setting one part of it apart in weight was
// a claim the skin had no standing to make.
//
// So on a list page it does nothing at all, which is the point: the two pages
// agree because the cover was brought to the list's spelling, not because both
// were brought to a third one of ours.
//
// Without scripting a reader sees what Tistory sent, which is never wrong --
// only inconsistent between pages, and that was true before any of this.

const SOURCE = "[data-quiet-cat]";

const same = (a: string, b: string): boolean =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

// The category listing this label points at, as its parts.
function fromUrl(url: string): string[] {
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

// A label Tistory already sent as a path. This is the shape everything else is
// being brought to, so there is nothing to do to it -- and nothing is done: on a
// list page this module writes no text and touches no node.
function alreadyATrail(label: string): boolean {
  return label.includes("/");
}

export function initLineage(): void {
  for (const el of document.querySelectorAll<HTMLElement>(SOURCE)) {
    const label = (el.textContent ?? "").trim();
    if (alreadyATrail(label)) continue;

    const path = fromUrl(el.dataset.quietCat ?? "");
    if (path.length < 2) continue;
    // A bare leaf is only extended when it still reads as the leaf its own url
    // ends in. A category can be renamed without its url following, and a label
    // that has parted company with its path is not one to build a trail out of.
    //
    // Compared without case, because a url is not obliged to carry the name's.
    // The leaf then keeps the wording Tistory sent rather than the spelling in
    // the url, or that comparison is how "TypeScript" would become "typescript".
    if (!same(label, path[path.length - 1])) continue;

    // Plain text, and a slash with no spaces around it, because that is exactly
    // how Tistory writes a category path itself. Nothing is wrapped and nothing
    // is styled: the whole string is the category, and setting one part of it
    // apart was a claim this skin had no standing to make.
    el.textContent = [...path.slice(0, -1), label].join("/");
  }
}
