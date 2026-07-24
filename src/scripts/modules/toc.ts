// Build a table of contents from article headings into the right rail and track
// the active section. Preserves author-supplied ids; only generates missing ones.
export function initToc(): void {
  const body = document.getElementById("sw-article-body");
  if (!body) return;
  const slot = document.getElementById("sw-toc-slot");
  const heads = body.querySelectorAll<HTMLElement>("h2, h3");

  // No headings: collapse the reading band to a single column, no TOC.
  if (!heads.length) {
    document.querySelector(".sw-article-shell")?.classList.add("sw-no-toc");
    return;
  }
  if (!slot) return;

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
    const label = h.textContent ?? "";
    const anchor = document.createElement("a");
    anchor.className = "anchor";
    anchor.href = `#${h.id}`;
    anchor.textContent = "#";
    anchor.setAttribute("aria-hidden", "true");
    h.appendChild(anchor);
    items.push(
      `<li class="${h.tagName === "H3" ? "h3" : "h2"}"><a href="#${h.id}">${label}</a></li>`,
    );
  });

  slot.innerHTML = `<div class="sw-toc-inner"><h4>On this page</h4><ol>${items.join("")}</ol></div>`;

  const links = new Map<string, HTMLElement>();
  slot.querySelectorAll<HTMLElement>('a[href^="#"]').forEach((l) => {
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
