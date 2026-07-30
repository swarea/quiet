// Theme toggle: sets data-theme on <html>, persists, wins over the media query.
const KEY = "quiet-theme";
const SUN =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';

function isDark(): boolean {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr) return attr === "dark";
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return stored === "dark";
  } catch {
    /* storage unavailable */
  }
  return matchMedia("(prefers-color-scheme: dark)").matches;
}

// Whichever accent the blogger chose for this theme, the text laid on it has to
// be readable. Measured rather than assumed: assuming white is how a ratio of
// 2.37 shipped. The head script does this once before the first paint so the
// page never flashes the wrong one; this repeats it whenever the theme changes,
// because the two themes may carry very different accents.
function fitOnAccent(): void {
  const root = document.documentElement;
  const accent = getComputedStyle(root)
    .getPropertyValue(isDark() ? "--dark-accent" : "--light-accent")
    .trim();
  const m = accent.match(/^#?([0-9a-f]{6})$/i);
  if (!m) {
    root.style.removeProperty("--on-accent");
    return;
  }
  const n = parseInt(m[1], 16);
  const channel = (c: number): number => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const L =
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255);
  const onBlack = (L + 0.05) / 0.05;
  const onWhite = 1.05 / (L + 0.05);
  root.style.setProperty("--on-accent", onBlack > onWhite ? "#101216" : "#ffffff");
}

function paintIcons(): void {
  const dark = isDark();
  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((b) => {
    b.innerHTML = dark ? SUN : MOON;
    // Name the button by what pressing it does, not by the state it is in —
    // "Toggle theme" alone tells a screen reader nothing about the outcome.
    b.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  });
}

function stored(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

// Move the whole page at once, or move it instantly. Anything in between is
// what made the old switch hurt: the ground faded for three tenths of a second
// while everything standing on it had already gone dark.
//
// A view transition cross-fades a snapshot of the document, so the cost does not
// grow with the length of the page -- which matters here, where one post can
// carry a hundred code blocks. Browsers without it get the change with no
// animation, which is coherent even if it is abrupt. A reader who has asked for
// less motion gets the same.
//
// Every element transition is held off for the length of the swap. A property
// fed by a theme token and given a transition of its own was left holding the
// previous theme's value -- not briefly, but until something else happened to
// invalidate it. Measured after a single toggle: 41 elements across 13 kinds,
// among them the whole category tree, whose text stayed at the light theme's
// #3f434a on a dark page, a contrast of 1.70. The page has one animation during
// a theme change and it belongs to the view transition; anything else competing
// with it was never wanted.
function change(apply: () => void): void {
  const root = document.documentElement;
  const start = (document as Document & {
    startViewTransition?: (cb: () => void) => { updateCallbackDone?: Promise<unknown> };
  }).startViewTransition;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.add("quiet-swapping");
  let released = false;
  const release = (): void => {
    released = true;
    root.classList.remove("quiet-swapping");
  };
  const releaseNextFrame = (): void => {
    // A frame after the new colours are in, so the release cannot itself be the
    // thing that starts a transition.
    requestAnimationFrame(release);
  };
  // Whatever else happens, the hold ends. Waiting on the transition to finish
  // was the first attempt and it does not: in a hidden tab the animation never
  // runs, the promise never settles, and every transition on the page stays
  // switched off for good. Measured -- three toggles in, hover was dead.
  setTimeout(() => {
    if (!released) release();
  }, 400);

  if (typeof start !== "function" || still) {
    apply();
    releaseNextFrame();
    return;
  }
  const run = start.call(document, apply);
  // The colours are exchanged by the time the update callback is done. The
  // cross-fade carries on afterwards; it is the view transition's own animation
  // and owes nothing to the transitions being held.
  const swapped = run && typeof run === "object" ? run.updateCallbackDone : undefined;
  if (swapped && typeof swapped.then === "function") swapped.then(releaseNextFrame, release);
  else releaseNextFrame();
}

export function initTheme(): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", isDark() ? "dark" : "light");
  fitOnAccent();
  paintIcons();

  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* ignore */
      }
      change(() => {
        root.setAttribute("data-theme", next);
        fitOnAccent();
        paintIcons();
      });
    });
  });

  // Writing data-theme onto the element settles the flash before first paint,
  // but it also outranks the media query from then on. A reader whose system
  // turns dark at dusk would sit in the theme they arrived in for the rest of
  // the visit. Follow the system while they have not said otherwise; the moment
  // they press the button, their choice is stored and this stops applying.
  const system = matchMedia("(prefers-color-scheme: dark)");
  const follow = (e: MediaQueryList | MediaQueryListEvent): void => {
    if (stored()) return;
    change(() => {
      root.setAttribute("data-theme", e.matches ? "dark" : "light");
      fitOnAccent();
      paintIcons();
    });
  };
  if (typeof system.addEventListener === "function") system.addEventListener("change", follow);
  else if (typeof system.addListener === "function") system.addListener(follow);
}
