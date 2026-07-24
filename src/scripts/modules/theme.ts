// Theme toggle: sets data-theme on <html>, persists, wins over the media query.
const KEY = "sw-theme";
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

function paintIcons(): void {
  const html = isDark() ? SUN : MOON;
  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((b) => {
    b.innerHTML = html;
  });
}

export function initTheme(): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", isDark() ? "dark" : "light");
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
      paintIcons();
    });
  });
}
