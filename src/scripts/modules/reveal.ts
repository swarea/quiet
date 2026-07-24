// Reveal .sw-reveal blocks as they scroll into view (once). Respects reduced motion.
export function initReveal(): void {
  const els = document.querySelectorAll<HTMLElement>(".sw-reveal");
  if (!els.length) return;

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          obs.unobserve(en.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );
  els.forEach((el) => obs.observe(el));
}
