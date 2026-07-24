// Mobile sidebar drawer: toggle button, scrim, Escape to close.
export function initDrawer(): void {
  const rail = document.getElementById("sw-rail");
  const scrim = document.getElementById("sw-scrim");
  const btn = document.getElementById("sw-menu-btn");
  if (!rail || !scrim || !btn) return;

  const set = (open: boolean): void => {
    rail.classList.toggle("open", open);
    scrim.classList.toggle("open", open);
    scrim.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  };

  btn.addEventListener("click", () => set(!rail.classList.contains("open")));
  scrim.addEventListener("click", () => set(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") set(false);
  });
}
