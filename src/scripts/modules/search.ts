// "/" focuses the search input, unless already typing in a field.
export function initSearchShortcut(): void {
  const input = document.getElementById("quiet-search-input");
  if (!input) return;
  addEventListener("keydown", (e) => {
    if (e.key !== "/") return;
    // A shortcut, not a chord: Ctrl+/ and Cmd+/ belong to the browser.
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    const tag = target?.tagName ?? "";
    if (/input|textarea|select/i.test(tag) || target?.isContentEditable) return;
    // The field lives in the rail, which on a narrow screen is slid off the
    // side rather than removed -- so it stays focusable, and focusing it sent
    // the reader's typing somewhere they could not see. Open the drawer first.
    const btn = document.getElementById("quiet-menu-btn");
    if (btn?.offsetParent && btn.getAttribute("aria-expanded") !== "true") btn.click();
    e.preventDefault();
    input.focus();
  });
}
