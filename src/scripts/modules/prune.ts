// Tistory renders every sidebar section and list block we declare, even when it
// has no entries. Remove the empty shells, and put a real empty state — worded
// for the page you are actually on — where a post list came back with nothing.
const EMPTY_GLYPH =
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h11l3 3v13H5z"/><path d="M9 12h6M9 16h4"/></svg>';

// Tistory stamps the page type on <body>, which is the only reliable signal for
// wording the message correctly.
// A second line only earns its place when it tells the reader what to do next.
// Promising that a category will fill up is not ours to promise, and telling a
// reader that posts appear once published is addressed to the wrong person.
const MESSAGES: Record<string, [string, string?]> = {
  "tt-body-search": ["No results", "Try a different search term."],
  "tt-body-category": ["No posts in this category yet"],
  "tt-body-tag": ["No posts with this tag"],
  "tt-body-archive": ["No posts from this period"],
};
const DEFAULT_MESSAGE: [string, string?] = ["No posts yet"];

function escape(text: string): string {
  const el = document.createElement("span");
  el.textContent = text;
  return el.innerHTML;
}

// Tistory prints a clock time instead of a date for posts published today, so a
// list can read "16:03:03" beside dated entries. Say what it means instead.
function humaniseTodayStamps(): void {
  document.querySelectorAll<HTMLElement>(".sw-post-row time, .sw-side-list time").forEach((el) => {
    const text = (el.textContent ?? "").trim();
    if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(text)) return;
    el.dateTime = text;
    el.title = text;
    el.textContent = "Today";
  });
}

export function initPrune(): void {
  humaniseTodayStamps();
  // Sidebar sections whose list rendered no real links.
  document.querySelectorAll<HTMLElement>(".sw-rail nav").forEach((nav) => {
    const links = Array.from(nav.querySelectorAll("a")).filter(
      (a) => (a.textContent ?? "").trim().length > 0,
    );
    if (!links.length) nav.hidden = true;
  });

  // Post lists that came back empty.
  const [heading, detail] = MESSAGES[document.body.id] ?? DEFAULT_MESSAGE;
  document.querySelectorAll<HTMLElement>(".sw-recent").forEach((list) => {
    if (list.querySelector(".sw-post-row")) return;
    const box = document.createElement("div");
    box.className = "sw-empty";
    box.lang = "en";
    box.innerHTML =
      `<div class="glyph" aria-hidden="true">${EMPTY_GLYPH}</div>` +
      `<h2>${escape(heading)}</h2>` +
      (detail ? `<p>${escape(detail)}</p>` : "");
    list.appendChild(box);
  });
}
