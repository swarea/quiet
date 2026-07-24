// Tistory always renders every sidebar section and list block we declare, even
// when it has no entries. Remove the empty shells and put a real empty state
// where a post list came back with nothing.
const EMPTY_GLYPH =
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h11l3 3v13H5z"/><path d="M9 12h6M9 16h4"/></svg>';

export function initPrune(): void {
  // Sidebar sections whose list rendered no real links.
  document.querySelectorAll<HTMLElement>(".sw-rail nav").forEach((nav) => {
    const links = Array.from(nav.querySelectorAll("a")).filter(
      (a) => (a.textContent ?? "").trim().length > 0,
    );
    if (!links.length) nav.hidden = true;
  });

  // Post lists that came back empty.
  document.querySelectorAll<HTMLElement>(".sw-recent").forEach((list) => {
    if (list.querySelector(".sw-post-row")) return;
    const box = document.createElement("div");
    box.className = "sw-empty";
    box.innerHTML =
      `<div class="glyph" aria-hidden="true">${EMPTY_GLYPH}</div>` +
      "<h2>아직 글이 없습니다</h2><p>글을 발행하면 이곳에 표시됩니다.</p>";
    list.appendChild(box);
  });
}
