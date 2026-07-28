// Say what language a post is actually in.
//
// The standard arrangement is that `<html lang>` names the page's main language
// and any subtree in another language says so on itself. A skin cannot do the
// second half from the template: it is one file, and Tistory offers nothing that
// says which language a given post was written in. So the post says it here,
// from its own words.
//
// This does not reach a search engine, which reads the HTML as served. It does
// reach a screen reader, which reads the document after scripts have run — and
// that is where the attribute actually decides something, since a reader
// announcing English with Korean phonetics is unintelligible either way round.
//
// With scripting off, the page keeps whatever `<html lang>` says, which is the
// blogger's own answer for the blog as a whole. Nothing is worse than before.

// Hangul syllables, plus the jamo that appear on their own in running text.
const HANGUL = /[가-힣ㄱ-ㅣ]/g;
const LATIN = /[A-Za-z]/g;

// Where the post's own words are. The byline, the tags and the comments are
// not the post, and a Korean comment on an English essay should not decide it.
const BODY = ".quiet-article-body";

function count(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

export function initLang(): void {
  const body = document.querySelector<HTMLElement>(BODY);
  if (!body) return;

  const text = body.textContent ?? "";
  const hangul = count(text, HANGUL);
  const latin = count(text, LATIN);

  // Below this there is not enough writing to judge, and a wrong answer is
  // worse than the blog-level one already in place.
  if (hangul + latin < 60) return;

  // A wide margin either way, because mixed writing is the normal case: an
  // English post quotes Korean, a Korean post quotes code and English terms.
  // Only a clear majority moves the label off what the blog already declared.
  const share = latin / (hangul + latin);
  const declared = document.documentElement.lang || "ko";

  if (share > 0.85 && declared !== "en") body.lang = "en";
  else if (share < 0.15 && declared !== "ko") body.lang = "ko";
}
