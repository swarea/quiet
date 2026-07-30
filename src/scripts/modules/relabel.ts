// Tistory writes its own controls into the article — the like button, the share
// menu, subscribe, post management — and those arrive in Korean whatever the
// skin says. With the rest of the interface in English they would be the only
// Korean words on the page, so they are relabelled here.
//
// Only two of these strings are actually on screen: the word beside the like
// count and the subscribe label. The rest sit at font-size:0 and exist purely
// as accessible names. They are translated too, because a screen reader
// announcing Korean for a button that reads English is worse than either
// language on its own — the accessible name has to match the visible one.
//
// This is an enhancement, not a dependency: with scripting off the controls
// still work, they just keep Tistory's wording.

// Replacement is by substring, so a short phrase can eat the front of a longer
// one. This list used to say "longest first" and leave it at that; it was not
// actually in that order, and a comment is not a rule anything enforces. It is
// sorted by key length before use now.
//
// Sorting only settles conflicts between entries here. A Korean word that is
// the start of a longer Tistory string it does not know about will still cut
// it: "신고" turned Tistory's own "신고하기" into "Report하기" on a live page,
// which is why the compound is listed as well.
const PHRASES: ReadonlyArray<readonly [string, string]> = [
  ["동일조건변경허락", "ShareAlike"],
  ["비공개로 변경", "Make private"],
  ["카카오톡 공유", "Share on KakaoTalk"],
  ["공개로 변경", "Make public"],
  ["저작자표시", "Attribution"],
  ["변경금지", "NoDerivatives"],
  ["비영리", "NonCommercial"],
  ["페이스북 공유", "Share on Facebook"],
  ["게시글 관리", "Post options"],
  ["트위터 공유", "Share on X"],
  ["URL 복사", "Copy link"],
  ["엑스 공유", "Share on X"],
  ["공유하기", "Share"],
  ["구독하기", "Subscribe"],
  ["구독중", "Subscribed"],
  ["좋아요", "Like"],
  ["수정", "Edit"],
  ["삭제", "Delete"],
  ["신고하기", "Report"],
  ["신고", "Report"],
  ["관리메뉴열기", "Open menu"],
  ["공감", "Like"],
];

// Where Tistory's own markup lives. Everything outside these roots is either
// ours or the author's writing, and must not be touched.
const ROOTS =
  ".container_postbtn, .layer_post, .bundle_post, .wrap_btn, #menubar, .menu_toolbar";

const ORDERED = [...PHRASES].sort((a, b) => b[0].length - a[0].length);

function translate(text: string): string {
  let out = text;
  for (const [ko, en] of ORDERED) out = out.split(ko).join(en);
  return out;
}

function relabel(root: ParentNode): void {
  // Visible words and screen-reader-only words are the same text nodes here.
  const walker = document.createTreeWalker(root as Node, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const value = node.nodeValue ?? "";
    const next = translate(value);
    if (next !== value) node.nodeValue = next;
  }

  // The heart already says "like", so the word beside it is noise. Tistory
  // writes the word and the count into the same element, so keep the digits and
  // drop the rest; the button's accessible name still carries "Like".
  root.querySelectorAll?.(".txt_like").forEach((el) => {
    const count = (el.textContent ?? "").match(/\d[\d,]*/);
    const next = count ? count[0] : "";
    if (el.textContent !== next) el.textContent = next;
  });

  // Accessible names carried on attributes rather than in the text.
  root.querySelectorAll?.("[aria-label], [title]").forEach((el) => {
    for (const attr of ["aria-label", "title"]) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      const next = translate(value);
      if (next !== value) el.setAttribute(attr, next);
    }
  });
}

// The author's own controls in the byline. Tistory supplies the label for the
// visibility toggle, so it arrives in Korean beside "Edit" and "Delete".
function relabelBylineAdmin(): void {
  const MAP: Record<string, string> = { "보호": "Protect", "공개": "Publish", "발행": "Publish" };
  document.querySelectorAll<HTMLElement>(".quiet-byline .admin a").forEach((link) => {
    const text = (link.textContent ?? "").trim();
    const next = MAP[text];
    if (next) link.textContent = next;
  });
}

// Tistory writes this in place of a category name when a post has none, so it
// turns up in a list row beside categories the author did name.
function renameUncategorised(): void {
  document.querySelectorAll<HTMLElement>(".quiet-post-row .cat, .quiet-crumb").forEach((el) => {
    if ((el.textContent ?? "").trim() === "카테고리 없음") el.textContent = "Uncategorised";
  });
}

// Tistory names the first entry of the category tree "분류 전체보기". It is
// Tistory's wording rather than a category the author named, and in a sidebar
// whose own labels are English it is the one Korean phrase left that is not the
// author's writing. Tistory appends the post count, which is the useful half,
// so only the phrase itself is replaced.
// The heading of a list page comes from one token that Tistory fills with
// whatever names the list: a category the author created, a search the reader
// typed, an archive month, or — for the complete listing — a phrase of its own.
// Only that last case is ours to translate, so the match is exact. Anything the
// author or the reader supplied passes through untouched, including a category
// they happened to name "분류".
const LISTING_NAMES = new Map([
  ["분류 전체보기", "All posts"],
  ["전체 글", "All posts"],
]);

function renameListingHeading(): void {
  const heading = document.querySelector<HTMLElement>(".quiet-list-head h1");
  if (!heading) return;
  const text = (heading.textContent ?? "").trim();
  const named = LISTING_NAMES.get(text);
  if (named) {
    heading.textContent = named;
    return;
  }
  // A blog whose Tistory settings are in English gets "Categories" for the same
  // listing, which is a heading over every post the blog has and not a list of
  // categories at all. Renamed only on the complete listing's own path, because
  // "Categories" is a name an author could give a category, and on that
  // category's page the heading would be theirs rather than Tistory's.
  if (text === "Categories" && ALL_POSTS_PATH.test(location.pathname)) {
    heading.textContent = "All posts";
  }
}

// Every category row but this one arrives as a label plus a `.c_cnt` span, which
// the stylesheet sets small, monospaced and faint. Tistory writes the root's
// count into the label itself, so "(6)" was not a count at all: it rendered at
// the label's size in the body face and read as part of the name. Split it back
// out so the row is built like the rows under it.
const COUNT = /^(.*?)\s*([([（]\s*\d+\s*[)）])\s*$/;

// The complete listing, and nothing under it.
const ALL_POSTS_PATH = /^\/category\/?$/;

// Tistory's own name for the root of the tree, in either language it writes it
// in. Both are Tistory's wording rather than a category the author created --
// the row is generated, it is always the link to /category, and an author has
// no way to rename it.
const ROOT_NAMES = /^(\s*)(분류\s*전체보기|전체보기|Categories)/;

function renameAllPosts(): void {
  document.querySelectorAll<HTMLAnchorElement>(".quiet-cat-tistory a").forEach((link) => {
    if (!/\/category\/?$/.test(link.getAttribute("href") ?? "")) return;
    // Where the count already has a span of its own, only the label is renamed,
    // and by editing its text node rather than the link -- writing textContent
    // on the link would take the count away with the Korean. Returning early
    // here used to discard the rename entirely, leaving the label in Korean.
    if (link.querySelector(".c_cnt, .cnt")) {
      const first = link.firstChild;
      if (first && first.nodeType === 3) {
        const was = first.textContent ?? "";
        const now = was.replace(ROOT_NAMES, "$1All posts");
        if (now !== was) first.textContent = now;
      }
      return;
    }

    const text = (link.textContent ?? "").trim();
    const next = text.replace(ROOT_NAMES, "$1All posts");
    const split = next.match(COUNT);
    if (!split) {
      if (next !== text) link.textContent = next;
      return;
    }
    link.textContent = split[1];
    const count = document.createElement("span");
    count.className = "c_cnt";
    count.textContent = split[2];
    link.append(count);
  });
}

// Tistory writes three of its own words into the comment list, outside the
// blocks it puts its controls in: a report link on every comment, and a name
// and a body for one it will not show. In a sidebar and a toolbar that read
// English these are the only Korean left that nobody wrote.
//
// Matched exactly, and the body only inside a comment Tistory has marked as
// hidden, so a reader who writes those words themselves keeps them.
function relabelComments(): void {
  document.querySelectorAll<HTMLElement>(".quiet-comment .when a").forEach((link) => {
    if ((link.textContent ?? "").trim() === "신고") link.textContent = "Report";
  });
  document.querySelectorAll<HTMLElement>(".quiet-comment .who").forEach((who) => {
    if ((who.textContent ?? "").trim() === "익명") who.textContent = "Anonymous";
  });
  document
    .querySelectorAll<HTMLElement>(".quiet-comment.rp_secret .txt, .quiet-comment.hiddenComment .txt")
    .forEach((txt) => {
      if ((txt.textContent ?? "").trim() === "비밀댓글입니다.") txt.textContent = "This comment is private";
    });
}

export function initRelabel(): void {
  renameAllPosts();
  relabelComments();
  renameListingHeading();
  renameUncategorised();
  relabelBylineAdmin();

  const roots = document.querySelectorAll<HTMLElement>(ROOTS);
  if (!roots.length) return;

  roots.forEach((root) => {
    relabel(root);
    // The words are English now, so say so — otherwise a screen reader reads
    // them with the Korean pronunciation the document language implies.
    root.lang = "en";
  });

  // Liking a post and subscribing both make Tistory rewrite these labels, which
  // would put the Korean back. Re-run on the subtree it replaced.
  const bar = document.querySelector(".container_postbtn");
  if (!bar || typeof MutationObserver === "undefined") return;
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    // Coalesce: Tistory replaces several nodes per interaction.
    requestAnimationFrame(() => {
      queued = false;
      observer.disconnect();
      relabel(bar);
      observer.observe(bar, { childList: true, subtree: true, characterData: true });
    });
  });
  observer.observe(bar, { childList: true, subtree: true, characterData: true });
}
