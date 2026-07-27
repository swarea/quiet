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

// Longest first, so "URL 복사" is not half-eaten by a shorter entry.
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
  ["신고", "Report"],
  ["공감", "Like"],
];

// Where Tistory's own markup lives. Everything outside these roots is either
// ours or the author's writing, and must not be touched.
const ROOTS = ".container_postbtn, .layer_post, .bundle_post, .wrap_btn";

function translate(text: string): string {
  let out = text;
  for (const [ko, en] of PHRASES) out = out.split(ko).join(en);
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

// Tistory names the first entry of the category tree "분류 전체보기". It is
// Tistory's wording rather than a category the author named, and in a sidebar
// whose own labels are English it is the one Korean phrase left that is not the
// author's writing. Tistory appends the post count, which is the useful half,
// so only the phrase itself is replaced.
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

function renameAllPosts(): void {
  document.querySelectorAll<HTMLAnchorElement>(".quiet-cat-tistory a").forEach((link) => {
    if (!/\/category\/?$/.test(link.getAttribute("href") ?? "")) return;
    const text = (link.textContent ?? "").trim();
    const next = text.replace(/^분류\s*전체보기|^전체보기/, "All posts");
    if (next !== text) link.textContent = next;
  });
}

export function initRelabel(): void {
  renameAllPosts();
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
