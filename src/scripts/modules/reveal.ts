// Reveal .quiet-reveal blocks as they scroll into view, once each.
//
// The hidden starting state is applied here rather than in the stylesheet: if
// this script never runs, the content must still be visible. Respects reduced
// motion by leaving everything alone.
export function initReveal(): void {
  const els = document.querySelectorAll<HTMLElement>(".quiet-reveal");
  if (!els.length) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  els.forEach((el) => {
    el.style.opacity = "0";
  });

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement;
        el.style.removeProperty("opacity");
        el.classList.add("in");
        obs.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );
  els.forEach((el) => obs.observe(el));
}
