// Mark the navigation entry for the page being read.
//
// Tistory labels category links `link_tit`, `link_item` and `link_sub_item`, and
// none of those say which one you are looking at. The sidebar therefore listed
// every destination without ever saying where you had arrived.
//
// This is the one thing worth emphasising in a sidebar. Making every top-level
// category bold said only that top-level categories exist, which the indentation
// already said; making the current one bold answers a question a reader actually
// has. `aria-current` carries the same answer to a screen reader, which is why
// the state is expressed as an attribute rather than a class of our own.

const NAV = ".quiet-cat-tistory a, .quiet-menu-tistory a";

function samePage(href: string | null): boolean {
  if (!href) return false;
  let path: string;
  try {
    path = new URL(href, location.href).pathname;
  } catch {
    return false;
  }
  const strip = (s: string): string => decodeURIComponent(s).replace(/\/+$/, "") || "/";
  return strip(path) === strip(location.pathname);
}

export function initCurrent(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(NAV);
  if (!links.length) return;

  // A category page matches its own entry and nothing else; the home page would
  // otherwise match both "Home" in the menu and the root of the tree, so the
  // first match wins and the rest are left alone.
  let marked = false;
  links.forEach((link) => {
    if (marked || !samePage(link.getAttribute("href"))) return;
    link.setAttribute("aria-current", "page");
    marked = true;
  });
}
