// Mobile sidebar drawer: toggle button, scrim, Escape to close.
// Manages focus: moves into the drawer on open, restores on close, traps Tab.
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function initDrawer(): void {
  const rail = document.getElementById("quiet-rail");
  const scrim = document.getElementById("quiet-scrim");
  const btn = document.getElementById("quiet-menu-btn");
  if (!rail || !scrim || !btn) return;

  let lastFocus: HTMLElement | null = null;

  // Everything the drawer covers. Trapping Tab keeps a sighted keyboard user
  // inside, but a screen reader's cursor is not bound by focus: measured with
  // the drawer open, fourteen headings behind the overlay were still reachable.
  // `inert` removes them from both; `aria-hidden` covers browsers without it,
  // where the Tab trap below is already doing the focus half of the job.
  const behind = (): HTMLElement[] =>
    Array.from(
      document.querySelectorAll<HTMLElement>(".quiet-content, .quiet-topbar, .quiet-dock"),
    );

  const setBehind = (hidden: boolean): void => {
    behind().forEach((el) => {
      if (hidden) {
        el.setAttribute("aria-hidden", "true");
        if ("inert" in el) el.inert = true;
      } else {
        el.removeAttribute("aria-hidden");
        if ("inert" in el) el.inert = false;
      }
    });
  };

  const focusables = (): HTMLElement[] =>
    Array.from(rail.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    );

  const set = (open: boolean): void => {
    rail.classList.toggle("open", open);
    scrim.classList.toggle("open", open);
    scrim.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    setBehind(open);
    if (open) {
      lastFocus = document.activeElement as HTMLElement | null;
      focusables()[0]?.focus();
    } else if (lastFocus) {
      lastFocus.focus();
      lastFocus = null;
    }
  };

  btn.addEventListener("click", () => set(!rail.classList.contains("open")));
  scrim.addEventListener("click", () => set(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && rail.classList.contains("open")) {
      set(false);
      return;
    }
    if (e.key !== "Tab" || !rail.classList.contains("open")) return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}
