// "/" focuses the search input, unless already typing in a field.
export function initSearchShortcut(): void {
  const input = document.getElementById("sw-search-input");
  if (!input) return;
  addEventListener("keydown", (e) => {
    const tag = (e.target as HTMLElement | null)?.tagName ?? "";
    if (e.key === "/" && !/input|textarea/i.test(tag)) {
      e.preventDefault();
      input.focus();
    }
  });
}
