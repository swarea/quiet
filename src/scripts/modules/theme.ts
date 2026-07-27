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
  if (!m) return;
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

export function initTheme(): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", isDark() ? "dark" : "light");
  fitOnAccent();
  paintIcons();

  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* ignore */
      }
      fitOnAccent();
      paintIcons();
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
    root.setAttribute("data-theme", e.matches ? "dark" : "light");
    fitOnAccent();
    paintIcons();
  };
  if (typeof system.addEventListener === "function") system.addEventListener("change", follow);
  else if (typeof system.addListener === "function") system.addListener(follow);
}
