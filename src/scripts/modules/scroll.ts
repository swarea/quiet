// Reading progress bar + back-to-top button, throttled with rAF.
export function initScroll(): void {
  const bar = document.getElementById("sw-progress");
  const totop = document.getElementById("sw-totop");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (totop) {
    totop.addEventListener("click", () =>
      scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }),
    );
  }
  if (!bar && !totop) return;

  let ticking = false;
  const update = (): void => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 0;
    if (bar) bar.style.width = `${pct}%`;
    if (totop) totop.classList.toggle("show", scrollY > 500);
    ticking = false;
  };
  addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}
