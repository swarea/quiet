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
const STORE_KEY = "quiet-cat-open";

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
  btn.setAttribute("aria-label", `${open ? "Collapse" : "Expand"} subcategories of ${label}`);

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
    const sub = btn.parentElement?.querySelector<HTMLElement>(".quiet-sub");
    if (!sub) return;
    btn.addEventListener("click", () => {
      const open = !sub.classList.contains("open");
      sub.classList.toggle("open", open);
      btn.querySelector(".twist")?.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
}

// Tistory's own entry for the complete listing, the only <li> at the top of
// the tree.
function isRootEntry(li: HTMLElement, topList: HTMLElement): boolean {
  const href = li.querySelector<HTMLElement>(":scope > a")?.getAttribute("href") ?? "";
  return li.parentElement === topList && /\/category\/?$/.test(href);
}

// A parent's number is meant to cover everything under it, and Tistory usually
// writes it that way: across 64 parents on 12 blogs, 61 were equal to the sum of
// their sub-categories or above it. Not always. On this blog one read 9 over
// sub-categories holding 359, and opened a page of 368 -- its own 9 posts and
// nothing from beneath. Folded, which is how the rail starts, it was the only
// number on screen, so nothing beside it explained the gap.
//
// A total cannot be smaller than the parts it contains, so a parent below its
// children's sum is a direct count, and only that one is completed. One at or
// above the sum is left as written: adding to it would double-count the very
// parents Tistory got right (Projects, 10 over 0+5+5, would read 20). What this
// cannot catch is a direct count that happens to reach the sum, which looks
// exactly like a total; there is nothing on the page to tell them apart.
//
// Bottom-up, so a branch is compared against rows that are already totals and
// the result does not depend on how deep the tree goes. A row with no readable
// count leaves itself and everything above it alone, since a sum with a hole in
// it would be a wrong number rather than a missing one.
function rollUpCount(li: HTMLElement, rewrite: boolean): number | null {
  const label = li.querySelector<HTMLElement>(":scope > a .c_cnt, :scope > a .cnt");
  const own = /^(\D*)(\d+)(\D*)$/.exec(label?.textContent ?? "");
  if (!label || !own) return null;
  const shown = Number(own[2]);

  const children = Array.from(li.querySelectorAll<HTMLElement>(":scope > ul > li"));
  if (children.length === 0) return shown;

  let under = 0;
  let readable = true;
  for (const child of children) {
    const total = rollUpCount(child, true);
    if (total === null) readable = false;
    else under += total;
  }
  if (!readable) return null;

  if (shown >= under) return shown;
  const total = shown + under;
  if (rewrite) label.textContent = `${own[1]}${total}${own[3]}`;
  return total;
}

// Tistory's generated tree.
function initTistoryTree(): void {
  const root = document.querySelector<HTMLElement>(".quiet-cat-tistory");
  const topList = root?.querySelector<HTMLElement>(":scope > ul");
  if (!root || !topList) return;

  // The complete listing already counts every post, so its own figure stands;
  // it is only walked for the categories under it.
  topList.querySelectorAll<HTMLElement>(":scope > li").forEach((li) => {
    rollUpCount(li, !isRootEntry(li, topList));
  });

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
      li.classList.add("quiet-cat-root");
      return;
    }

    const label = (link.textContent ?? "").trim();
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiet-cat-fold";
    btn.innerHTML = `<span class="twist">${CHEVRON}</span>`;

    li.classList.add("has-sub");
    sub.classList.add("quiet-sub-tt");
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


export function initCategory(): void {
  initMockTree();
  initTistoryTree();
}
