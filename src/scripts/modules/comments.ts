// Tistory's highlight() flashes a linked comment with #FFFF44 unless the
// element carries an `activecommentbackground` attribute. Feed it our accent
// wash instead, and keep it correct when the reader switches theme.
function applyHighlightColour(): void {
  const wash = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent-wash")
    .trim();
  if (!wash) return;
  document.querySelectorAll<HTMLElement>(".sw-comment").forEach((c) => {
    c.setAttribute("activecommentbackground", wash);
  });
}

export function initComments(): void {
  if (!document.querySelector(".sw-comment")) return;
  applyHighlightColour();
  new MutationObserver(applyHighlightColour).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}

// Tistory appends its own name card (title, description, subscribe button) after
// the article. It repeats what our author box already says, so drop ours and
// keep theirs, which carries the working subscribe control.
export function initNamecard(): void {
  if (!document.querySelector(".tt_box_namecard")) return;
  document.querySelectorAll<HTMLElement>(".sw-author").forEach((el) => el.remove());
}
