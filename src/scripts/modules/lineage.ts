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
// Whichever shape arrives, one trail comes out. Without scripting a reader sees
// what Tistory sent, which is never wrong -- only inconsistent between pages,
// and that was true before any of this.

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

// Both shapes, reduced to one. Null means leave the label exactly as it came.
function trail(label: string, url: string): string[] | null {
  const own = label
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  // A label that already carries the trail is the better source of its own
  // wording, so it is split rather than looked up.
  if (own.length > 1) return own;

  const path = fromUrl(url);
  if (path.length < 2) return null;
  // A bare leaf is only extended when it still reads as the leaf its own url
  // ends in. A category can be renamed without its url following, and a label
  // that has parted company with its path is not one to build a trail out of.
  //
  // Compared without case, because a url is not obliged to carry the name's. The
  // leaf then keeps the wording Tistory sent rather than the spelling in the
  // url, or that comparison is how "TypeScript" would become "typescript".
  if (!same(label, path[path.length - 1])) return null;
  return [...path.slice(0, -1), label.trim()];
}

export function initLineage(): void {
  for (const el of document.querySelectorAll<HTMLElement>(SOURCE)) {
    const label = (el.textContent ?? "").trim();
    const parts = trail(label, el.dataset.quietCat ?? "");
    if (!parts) continue;

    // Built as nodes, never as markup: some of these names come back off a url.
    //
    // The separator is a real character rather than a CSS ::after, so that it
    // survives being copied and is spoken. Left to the stylesheet, selecting the
    // label yielded "ProgrammingTypeScript".
    el.textContent = "";
    for (const name of parts.slice(0, -1)) {
      const up = document.createElement("span");
      up.className = "up";
      up.textContent = name;
      el.append(up, " · ");
    }
    el.append(parts[parts.length - 1]);
  }
}
