// Collapsible category tree.
//
// Tistory renders the tree itself from [##_category_list_##] as nested
// <ul class="tt_category"> lists with no way to fold them, so a blog with many
// categories fills the whole rail. We add the control afterwards: a real button
// beside the link, never replacing it, so the category stays navigable and the
// control carries its own accessible name.
//
// Two rules matter here. Every category hangs off Tistory's "all posts" entry,
// so that entry is never foldable — folding it would hide the entire tree.
// And branches start open: the tree is the rail's primary navigation, so it has
// to be readable at a glance, with folding available to tidy long branches.
// Choices persist, since Tistory serves a full page load on every click.
const CHEVRON =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
const STORE_KEY = "sw-cat-collapsed";

function loadCollapsed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function saveCollapsed(set: Set<string>): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...set]));
  } catch {
    /* storage unavailable; folding still works for this page */
  }
}

function setOpen(sub: HTMLElement, btn: HTMLElement, label: string, open: boolean): void {
  sub.classList.toggle("open", open);
  btn.querySelector(".twist")?.classList.toggle("open", open);
  btn.setAttribute("aria-expanded", String(open));
  btn.setAttribute("aria-label", `${label} 하위 카테고리 ${open ? "접기" : "펼치기"}`);
}

// Our own markup in the mock preview.
function initMockTree(): void {
  document.querySelectorAll<HTMLElement>("[data-cat-toggle]").forEach((btn) => {
    const sub = btn.parentElement?.querySelector<HTMLElement>(".sw-sub");
    if (!sub) return;
    btn.addEventListener("click", () => {
      const open = !sub.classList.contains("open");
      sub.classList.toggle("open", open);
      btn.querySelector(".twist")?.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
}

// Tistory's generated tree.
function initTistoryTree(): void {
  const root = document.querySelector<HTMLElement>(".sw-cat-tistory");
  const topList = root?.querySelector<HTMLElement>(":scope > ul");
  if (!root || !topList) return;

  const collapsed = loadCollapsed();

  topList.querySelectorAll<HTMLElement>("li").forEach((li) => {
    const sub = li.querySelector<HTMLElement>(":scope > ul");
    const link = li.querySelector<HTMLElement>(":scope > a");
    if (!sub || !link) return;

    // The "all posts" entry at the top of the list contains every category.
    // Leave it alone so the categories under it are simply always there.
    const href = link.getAttribute("href") ?? "";
    if (li.parentElement === topList && /\/category\/?$/.test(href)) {
      // Marked so the stylesheet can treat its children as the top level
      // rather than as an indented branch.
      li.classList.add("sw-cat-root");
      return;
    }

    const label = (link.textContent ?? "").trim();
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sw-cat-fold";
    btn.innerHTML = `<span class="twist">${CHEVRON}</span>`;

    li.classList.add("has-sub");
    sub.classList.add("sw-sub-tt");
    link.before(btn);

    setOpen(sub, btn, label, !collapsed.has(href));

    btn.addEventListener("click", () => {
      const open = !sub.classList.contains("open");
      setOpen(sub, btn, label, open);
      if (open) collapsed.delete(href);
      else collapsed.add(href);
      saveCollapsed(collapsed);
    });
  });
}

// Tistory labels the root of the tree "분류 전체보기". Sitting under a heading
// that already says Categories, "분류" just repeats itself. Rename the text node
// only, leaving the count and any badge Tistory appended untouched.
function shortenRootLabel(): void {
  document.querySelectorAll(".sw-cat-tistory a").forEach((a) => {
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
