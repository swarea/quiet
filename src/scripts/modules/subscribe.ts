// Subscribing belongs beside the line that says whose blog this is, not in the
// row of tools for the post you just read. Those tools act on one article; this
// one is a standing commitment to the author, and the block that introduces the
// author is where a reader decides to make it.
//
// Tistory's button is not moved to get it there. Its click behaviour is bound
// by Tistory's own script, and whether that binding survives being reparented
// is not something we can know from the outside — a delegated handler rooted at
// the toolbar would simply stop firing. So the original stays exactly where it
// was rendered, hidden, and the button in the author block presses it.
//
// The original is hidden only once the replacement is in place, so a failure
// anywhere in this module leaves Tistory's own button visible and working.

function labelOf(original: HTMLElement): string {
  // Tistory writes the blog title into this button alongside the state, so the
  // state element is the only part worth mirroring.
  const state = original.querySelector(".txt_state");
  const text = (state?.textContent ?? original.textContent ?? "").trim();
  return text || "Subscribe";
}

export function initSubscribe(): void {
  const host = document.querySelector<HTMLElement>(".quiet-author");
  const original = document.querySelector<HTMLElement>(
    ".container_postbtn .btn_menu_toolbar.btn_subscription",
  );
  if (!host || !original || host.querySelector(".quiet-subscribe")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "quiet-subscribe";
  button.lang = "en";
  button.textContent = labelOf(original);
  button.addEventListener("click", () => original.click());
  host.appendChild(button);

  // Only now is it safe to take the original out of the layout.
  document.querySelector(".container_postbtn")?.classList.add("quiet-sub-moved");

  // Subscribing flips the original's label; keep ours saying the same thing.
  if (typeof MutationObserver === "undefined") return;
  const observer = new MutationObserver(() => {
    const next = labelOf(original);
    if (next !== button.textContent) button.textContent = next;
  });
  observer.observe(original, { childList: true, subtree: true, characterData: true });
}
