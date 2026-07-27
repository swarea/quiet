// Copy button for code blocks; shows a transient confirmed state.
export function initCodeCopy(): void {
  document.querySelectorAll<HTMLElement>("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const block = btn.closest(".quiet-code");
      const pre = block?.querySelector("pre");
      if (!pre) return;
      const label = btn.querySelector("span");
      const done = (): void => {
        btn.classList.add("ok");
        if (label) {
          const prev = label.textContent;
          label.textContent = "Copied";
          setTimeout(() => {
            label.textContent = prev;
            btn.classList.remove("ok");
          }, 1400);
        }
      };
      const text = pre.textContent ?? "";
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
      else done();
    });
  });
}
