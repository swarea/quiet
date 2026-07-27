// Collapsible category tree.
//
// Tistory renders the tree itself from [##_category_list_##] as nested
// <ul class="tt_category"> lists with no way to fold them, so a blog with many
// categories fills the whole rail. We add the control afterwards: a real button
// beside the link, never replacing it, so the category stays navigable and the
// control carries its own accessible name.
//
// Two rules matter here. Every category hangs off Tistory's "all posts" entry,
// so that entry is never foldable — folding it would hide the entire tree and
// leave the rail with a single row. Below that, branches start closed, so the
// rail opens as a readable list of top-level categories rather than every
// sub-category at once; the branch holding the page you are on opens itself so
// you can see where you are. Choices persist, since Tistory serves a full page
// load on every click.
const CHEVRON =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
// Renamed alongside the flip from "which are closed" to "which are open", so
// a reader with the old list stored does not get the inverse of it.
const STORE_KEY = "sw-cat-open";

function loadExpanded(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function saveExpanded(set: Set<string>): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...set]));
  } catch {
    /* storage unavailable; folding still works for this page */
  }
}

// Animating max-height to a fixed ceiling is what makes an accordion feel
// wrong: with a 960px ceiling over a branch only 79px tall, the panel reaches
// full height 21ms into a 260ms run and then idles, and closing idles first and
// snaps at the very end. Measuring the panel and animating to its real height
// makes the motion match the distance actually travelled.
function setOpen(
  sub: HTMLElement,
  btn: HTMLElement,
  label: string,
  open: boolean,
  animate = true,
): void {
  sub.classList.toggle("open", open);
  btn.querySelector(".twist")?.classList.toggle("open", open);
  btn.setAttribute("aria-expanded", String(open));
  btn.setAttribute("aria-label", `${label} 하위 카테고리 ${open ? "접기" : "펼치기"}`);

  if (!animate) {
    // Initial state: land there directly, with no motion on page load.
    sub.style.transition = "none";
    sub.style.maxHeight = open ? "none" : "0px";
    requestAnimationFrame(() => sub.style.removeProperty("transition"));
    return;
  }

  if (open) {
    sub.style.maxHeight = `${sub.scrollHeight}px`;
    // Release the cap afterwards so a nested branch opening later is not
    // clipped by a height measured before it existed.
    sub.addEventListener(
      "transitionend",
      (e) => {
        if (e.propertyName === "max-height" && sub.classList.contains("open")) {
          sub.style.maxHeight = "none";
        }
      },
      { once: true },
    );
  } else {
    // Coming from "none" there is no start value to animate from, so pin the
    // current height for a frame first.
    sub.style.maxHeight = `${sub.scrollHeight}px`;
    void sub.offsetHeight;
    sub.style.maxHeight = "0px";
  }
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

  const expanded = loadExpanded();
  const here = decodeURIComponent(location.pathname);

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

    // Open if the reader opened it before, or if the page they are on lives
    // inside it — otherwise the current category would be hidden from them.
    const holdsCurrentPage = Array.from(sub.querySelectorAll("a")).some(
      (a) => decodeURIComponent(a.getAttribute("href") ?? "") === here,
    );
    setOpen(sub, btn, label, expanded.has(href) || holdsCurrentPage, false);

    btn.addEventListener("click", () => {
      const open = !sub.classList.contains("open");
      setOpen(sub, btn, label, open);
      if (open) expanded.add(href);
      else expanded.delete(href);
      saveExpanded(expanded);
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
