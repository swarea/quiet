// When a blog only accepts comments from signed-in readers, Tistory asks the
// reader to sign in when they click the comment box. It asks twice.
//
// Measured on the live blog: one click on the textarea produces two identical
// confirms. Neither handler is on the textarea or on the form — clicking either
// of those directly produces none — so both are delegated from further up, and
// stopping the event at the textarea removes not one of them but both, taking
// the sign-in check with it. There is nothing to unbind that leaves the check
// standing.
//
// So the handlers are left alone and the reader is asked once. Both still run
// and both receive the same answer; only the second dialog is skipped, and only
// when it repeats the same question within the same click.

export function initConfirmOnce(): void {
  if (typeof window.confirm !== "function") return;
  const native = window.confirm.bind(window);

  // A click is the unit of deduplication: two prompts raised by one click are a
  // repeat, the same prompt raised by two clicks is not. Capture runs before
  // the delegated handlers, so the count is already current when they ask.
  let asked: { click: number; message: string; answer: boolean } | null = null;
  let click = 0;
  document.addEventListener(
    "click",
    () => {
      click += 1;
      // Bounded to the dispatch, not to "until the next click". A prompt
      // raised later from a callback is a new question -- answering it from
      // a stale record would confirm a deletion nobody was asked about.
      const round = click;
      setTimeout(() => {
        if (asked && asked.click === round) asked = null;
      }, 0);
    },
    true,
  );

  window.confirm = (message?: string): boolean => {
    const text = String(message ?? "");
    if (asked && asked.click === click && asked.message === text) return asked.answer;
    const answer = native(text);
    asked = { click, message: text, answer };
    return answer;
  };
}
