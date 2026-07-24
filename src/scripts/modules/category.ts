// Collapsible category tree.
//
// Tistory renders the tree itself from [##_category_list_##] as nested
// <ul class="tt_category"> lists with no affordance to fold them, so a blog
// with many categories fills the whole rail. We add the toggle after the fact:
// a real button beside the link, never replacing it, so navigating to a parent
// category still works and keyboard users get a labelled control.
//
// The mock preview ships its own markup with data-cat-toggle, which is handled
// too so both render the same behaviour.
const CHEVRON =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

function setOpen(sub: HTMLElement, btn: HTMLElement, open: boolean): void {
  sub.classList.toggle("open", open);
  btn.querySelector(".twist")?.classList.toggle("open", open);
  btn.setAttribute("aria-expanded", String(open));
}

// Our own markup in the mock preview.
function initMockTree(): void {
  document.querySelectorAll<HTMLElement>("[data-cat-toggle]").forEach((btn) => {
    const sub = btn.parentElement?.querySelector<HTMLElement>(".sw-sub");
    if (!sub) return;
    btn.addEventListener("click", () =>
      setOpen(sub, btn, !sub.classList.contains("open")),
    );
  });
}

// Tistory's generated tree.
function initTistoryTree(): void {
  const root = document.querySelector<HTMLElement>(".sw-cat-tistory");
  if (!root) return;
  const here = decodeURIComponent(location.pathname);

  root.querySelectorAll<HTMLElement>("li").forEach((li) => {
    const sub = li.querySelector<HTMLElement>(":scope > ul");
    const link = li.querySelector<HTMLElement>(":scope > a");
    if (!sub || !link) return;

    const label = (link.textContent ?? "").trim();
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sw-cat-fold";
    btn.innerHTML = `<span class="twist">${CHEVRON}</span>`;
    btn.setAttribute("aria-label", `${label} 하위 카테고리 펼치기`);

    li.classList.add("has-sub");
    sub.classList.add("sw-sub-tt");
    link.before(btn);

    // Open the branch the reader is currently inside; fold the rest away.
    const active = Array.from(sub.querySelectorAll("a")).some(
      (a) => decodeURIComponent(a.getAttribute("href") ?? "") === here,
    );
    setOpen(sub, btn, active);

    btn.addEventListener("click", () =>
      setOpen(sub, btn, !sub.classList.contains("open")),
    );
  });
}

// Tistory labels the root of the tree "분류 전체보기". Sitting under a heading
// that already says Categories, "분류" just repeats itself. Rename the text node
// only, leaving the count and any badge Tistory appended untouched.
function shortenRootLabel(): void {
  const root = document.querySelector(".sw-cat-tistory");
  if (!root) return;
  root.querySelectorAll("a").forEach((a) => {
    a.childNodes.forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const text = node.textContent ?? "";
      if (text.includes("분류 전체보기")) {
        node.textContent = text.replace("분류 전체보기", "전체보기");
      }
    });
  });
}

export function initCategory(): void {
  shortenRootLabel();
  initMockTree();
  initTistoryTree();
}
