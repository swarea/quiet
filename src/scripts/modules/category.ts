// Expand/collapse sub-categories in the sidebar tree.
export function initCategory(): void {
  document.querySelectorAll<HTMLElement>("[data-cat-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const parent = btn.parentElement;
      const sub = parent?.querySelector(".sw-sub");
      const twist = btn.querySelector(".twist");
      if (!sub) return;
      const open = sub.classList.toggle("open");
      twist?.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
}
