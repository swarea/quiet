// Build a table of contents from article headings and track the active section.
// Preserves author-supplied ids; only generates ids where missing.
export function initToc(): void {
  // The skin setting can switch the table of contents off entirely.
  if (document.getElementById("sw-toc-off")) return;
  // Class, not id: article, notice, and page blocks all use it, and only one
  // of them is ever rendered on a given page.
  const body = document.querySelector<HTMLElement>(".sw-article-body");
  if (!body) return;
  const heads = body.querySelectorAll<HTMLElement>("h2, h3");
  if (!heads.length) return;

  const nav = document.createElement("nav");
  nav.className = "sw-toc";
  nav.setAttribute("aria-label", "목차");

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
    const label = h.textContent ?? "";
    h.appendChild(anchor);
    items.push(
      `<li class="${h.tagName === "H3" ? "h3" : "h2"}"><a href="#${h.id}">${label}</a></li>`,
    );
  });

  nav.innerHTML = `<div class="sw-toc-inner"><h4>On this page</h4><ol>${items.join("")}</ol></div>`;
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
}
