// Build a table of contents from article headings and track the active section.
// Preserves author-supplied ids; only generates ids where missing.
function escape(text: string): string {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

export function initToc(): void {
  // The skin setting can switch the table of contents off entirely.
  if (document.getElementById("quiet-toc-off")) return;
  // Class, not id: article, notice, and page blocks all use it, and only one
  // of them is ever rendered on a given page.
  const body = document.querySelector<HTMLElement>(".quiet-article-body");
  if (!body) return;
  const heads = body.querySelectorAll<HTMLElement>("h2, h3");
  if (!heads.length) return;

  const nav = document.createElement("nav");
  nav.className = "quiet-toc";
  // Same words as the heading below, so the landmark a screen reader announces
  // and the title a sighted reader sees are one name rather than two.
  nav.setAttribute("aria-label", "On this page");

  const used = new Set<string>();
  const items: string[] = [];
  heads.forEach((h) => {
    if (!h.id) {
      const base =
        (h.textContent ?? "")
          .trim()
          .toLowerCase()
          .replace(/[^\w가-힣]+/g, "-")
          .replace(/^-+|-+$/g, "") || "section";
      let id = base;
      let i = 2;
      while (used.has(id) || document.getElementById(id)) id = `${base}-${i++}`;
      h.id = id;
    }
    used.add(h.id);
    const anchor = document.createElement("a");
    anchor.className = "anchor";
    anchor.href = `#${h.id}`;
    anchor.textContent = "#";
    anchor.setAttribute("aria-hidden", "true");
    // Hidden from the accessibility tree, so it must not be a tab stop either.
    anchor.tabIndex = -1;
    const label = escape(h.textContent ?? "");
    h.appendChild(anchor);
    items.push(
      `<li class="${h.tagName === "H3" ? "h3" : "h2"}"><a href="#${h.id}">${label}</a></li>`,
    );
  });

  nav.innerHTML = `<div class="quiet-toc-inner"><h2>On this page</h2><ol>${items.join("")}</ol></div>`;
  document.body.appendChild(nav);

  const links = new Map<string, HTMLElement>();
  nav.querySelectorAll<HTMLElement>('a[href^="#"]').forEach((l) => {
    links.set((l.getAttribute("href") ?? "").slice(1), l);
  });

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.classList.remove("active"));
        links.get((en.target as HTMLElement).id)?.classList.add("active");
      });
    },
    { rootMargin: "-10% 0px -70% 0px", threshold: 0 },
  );
  heads.forEach((h) => obs.observe(h));

  addPanelToggle(nav, links);
}

// Narrow screens have no room for the rail, so the same list opens as a panel
// from the dock. Without this the contents simply vanished below 1600px, which
// is where most readers are.
const LIST_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>';

function addPanelToggle(nav: HTMLElement, links: Map<string, HTMLElement>): void {
  const dock = document.querySelector(".quiet-dock");
  if (!dock) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "toc-btn";
  btn.innerHTML = LIST_ICON;
  // One name, and `aria-expanded` carries the state. It used to say "Show
  // contents" and become "Hide contents", which announces the state twice --
  // "Hide contents, expanded" -- and is the thing the disclosure pattern asks
  // you not to do. The drawer's button next to it already worked this way, so
  // the two buttons in the same dock behaved differently. The name is the one
  // this thing is called everywhere else: the panel's heading and its landmark.
  btn.setAttribute("aria-label", "On this page");
  btn.setAttribute("aria-expanded", "false");
  // Below back-to-top, above the theme toggle: only back-to-top comes and goes
  // during a read, so it stays at the head of the column.
  const theme = dock.querySelector("[data-theme-toggle]");
  if (theme) dock.insertBefore(btn, theme);
  else dock.append(btn);

  const setOpen = (open: boolean): void => {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    if (open) nav.querySelector<HTMLElement>("a")?.focus();
  };

  btn.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  links.forEach((l) => l.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setOpen(false);
      btn.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("open")) return;
    const t = e.target as Node;
    if (!nav.contains(t) && !btn.contains(t)) setOpen(false);
  });
}
