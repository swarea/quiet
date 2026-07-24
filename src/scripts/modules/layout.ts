// Adapt the shell to conditions we only know at runtime: the sidebar can be
// switched off in skin settings, and Tistory pins its own toolbar bottom-right
// where our dock sits.
export function initLayout(): void {
  const shell = document.querySelector<HTMLElement>(".sw-shell");
  if (shell && !document.getElementById("sw-rail")) {
    shell.classList.add("sw-no-sidebar");
  }
  if (document.querySelector(".menu_toolbar")) {
    document.body.classList.add("sw-tt-toolbar");
  }
}
