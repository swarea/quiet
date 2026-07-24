// Tistory appends its own name card (blog title, description, subscribe button)
// after the article, repeating what our author box says. The card is mounted by
// a React app some time after our script runs, so we watch for it rather than
// checking once, then drop our duplicate and keep the card's working subscribe
// control. Gives up after a few seconds so the observer never lingers.
//
// The comment highlight colour is NOT handled here: Tistory flashes a linked
// comment while the document is still parsing, long before any deferred script,
// so that colour is set as an attribute directly in skin.html.
const GIVE_UP_MS = 5000;

function dropDuplicateAuthorBox(): boolean {
  if (!document.querySelector(".tt_box_namecard")) return false;
  document.querySelectorAll<HTMLElement>(".sw-author").forEach((el) => el.remove());
  return true;
}

export function initNamecard(): void {
  if (!document.querySelector(".sw-author")) return;
  if (dropDuplicateAuthorBox()) return;

  const observer = new MutationObserver(() => {
    if (dropDuplicateAuthorBox()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), GIVE_UP_MS);
}
