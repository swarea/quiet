// Adapt the shell to conditions we only know at runtime: the sidebar can be
// switched off in skin settings, and Tistory pins a subscribe bar to the
// bottom-right corner where our dock also sits.
const DOCK_GAP = 12; // breathing room between the dock and Tistory's bar

// Tistory's bar is fixed at the bottom right and its height varies with the
// blog title, so measure it rather than guessing a clearance. Re-measured on
// resize because the bar reflows with the viewport.
function liftDockAboveTistoryBar(): void {
  const dock = document.querySelector<HTMLElement>(".sw-dock");
  if (!dock) return;

  const apply = (): void => {
    const bars = Array.from(
      document.querySelectorAll<HTMLElement>(".menu_toolbar"),
    ).filter((el) => {
      const r = el.getBoundingClientRect();
      // Only bars that actually occupy the bottom-right corner matter.
      return r.width > 0 && r.height > 0 && innerHeight - r.bottom < innerHeight / 2;
    });
    if (!bars.length) {
      dock.style.removeProperty("--dock-lift");
      return;
    }
    const highest = Math.max(
      ...bars.map((el) => innerHeight - el.getBoundingClientRect().top),
    );
    dock.style.setProperty("--dock-lift", `${Math.round(highest + DOCK_GAP)}px`);
  };

  apply();
  addEventListener("resize", apply, { passive: true });
  // The bar is mounted by Tistory's own script, which may run after ours.
  const observer = new MutationObserver(apply);
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 5000);
}

export function initLayout(): void {
  const shell = document.querySelector<HTMLElement>(".sw-shell");
  if (shell && !document.getElementById("sw-rail")) {
    shell.classList.add("sw-no-sidebar");
  }
  liftDockAboveTistoryBar();
}
