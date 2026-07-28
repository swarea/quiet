// Copy button for code blocks; shows a transient confirmed state.
export function initCodeCopy(): void {
  document.querySelectorAll<HTMLElement>("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const block = btn.closest(".quiet-code");
      const pre = block?.querySelector("pre");
      if (!pre) return;
      const label = btn.querySelector("span");
      // Say what happened. Treating a rejected write as success, and reporting
      // success where there is no clipboard at all, told the reader the code
      // was on their clipboard when it was not.
      const report = (word: string): void => {
        btn.classList.add("ok");
        const prev = label?.textContent;
        if (label) label.textContent = word;
        setTimeout(() => {
          if (label) label.textContent = prev ?? "";
          btn.classList.remove("ok");
        }, 1400);
      };
      const text = pre.textContent ?? "";
      if (!navigator.clipboard) {
        report("Press Ctrl+C");
        return;
      }
      navigator.clipboard.writeText(text).then(
        () => report("Copied"),
        () => report("Copy failed"),
      );
    });
  });
}
