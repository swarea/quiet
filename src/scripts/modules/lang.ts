// Say what language the page is actually in.
//
// The standard arrangement is that `<html lang>` names the page's main language
// and any subtree in another language says so on itself. A skin cannot do
// either half honestly from the template: it is one file, and nothing Tistory
// offers says what language a post — or a blog — was written in. The setting
// asks the blogger, but a setting nobody opens is a wrong answer left standing,
// so the page checks its own words as well.
//
// Two jobs, and only one of them runs on any given page:
//
//   On a post, the post says what it is. The blog's declaration stays, because
//   one English essay does not make a Korean blog English.
//   Everywhere else, the page's own titles say what the blog publishes, and
//   that can correct the declaration itself.
//
// This does not reach a search engine, which reads the HTML as served, and it
// does not need to: search engines determine language from visible text rather
// than from this attribute. It reaches a screen reader, which reads the document
// after scripts have run, and that is where the attribute decides something —
// English announced with Korean phonetics is unintelligible either way round.
//
// With scripting off, nothing happens and the blogger's setting stands. Nothing
// is ever worse than before.

const HANGUL = /[가-힣ㄱ-ㅣ]/g;
const LATIN = /[A-Za-z]/g;

// A clear majority, because mixed writing is the normal case: an English post
// quotes Korean, a Korean post quotes code and English terms. Only a lopsided
// count moves a label off what was already declared.
const CLEAR = 0.85;

// Enough writing to judge. Below this a wrong answer is worse than the
// blog-level one already in place.
const ENOUGH_IN_POST = 60;
const ENOUGH_IN_TITLES = 40;

// Titles the blogger wrote. Our own English furniture is excluded by the
// lang="en" it already carries, and the category tree is left out because its
// first entry is a phrase the skin itself renames.
const TITLES = ".quiet-post-row h2, .quiet-post-row h3, .quiet-side-list a";

// Reading this many is plenty to tell one language from another, and it keeps
// the work bounded on a long archive page.
const SAMPLE = 24;

interface Tally {
  hangul: number;
  latin: number;
}

function tally(text: string, into: Tally): void {
  into.hangul += (text.match(HANGUL) ?? []).length;
  into.latin += (text.match(LATIN) ?? []).length;
}

// "en" when the writing is overwhelmingly Latin, "ko" when overwhelmingly
// Hangul, and null when it is neither or when there is too little to say.
function verdict(t: Tally, enough: number): "en" | "ko" | null {
  const total = t.hangul + t.latin;
  if (total < enough) return null;
  const latinShare = t.latin / total;
  if (latinShare > CLEAR) return "en";
  if (latinShare < 1 - CLEAR) return "ko";
  return null;
}

export function initLang(): void {
  const root = document.documentElement;
  const declared = root.lang || "ko";

  const post = document.querySelector<HTMLElement>(".quiet-article-body");
  if (post) {
    const t: Tally = { hangul: 0, latin: 0 };
    tally(post.textContent ?? "", t);
    const said = verdict(t, ENOUGH_IN_POST);
    // Marked on the post rather than on the document: the sidebar, the menu and
    // the category names around it are still whatever the blog is.
    if (said && said !== declared) post.lang = said;
    return;
  }

  // No post on this page, so what the blog publishes is the question, and the
  // titles on screen are the evidence. This one may correct the document.
  const t: Tally = { hangul: 0, latin: 0 };
  let read = 0;
  for (const el of document.querySelectorAll<HTMLElement>(TITLES)) {
    if (read >= SAMPLE) break;
    if (el.closest('[lang="en"]')) continue; // our words, not the blogger's
    tally(el.textContent ?? "", t);
    read += 1;
  }
  const said = verdict(t, ENOUGH_IN_TITLES);
  if (said && said !== declared) root.lang = said;
}
