// Click an article image to see it full size.
//
// Screenshots and diagrams are usually scaled down to the reading column, so
// without this the detail is simply lost. Images the author already wrapped in
// a link are left alone — that link is the author's intent.
//
// Purely additive: if this never runs, images stay inline and readable.
const CLOSE_ICON =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

let overlay: HTMLElement | null = null;
let lastFocus: HTMLElement | null = null;

// Everything the overlay covers. It calls itself a modal, so the page behind it
// has to stop being reachable -- by focus and by a screen reader's cursor alike.
function setBehind(hidden: boolean): void {
  document.querySelectorAll<HTMLElement>(".quiet-shell, .quiet-dock").forEach((el) => {
    if (hidden) {
      el.setAttribute("aria-hidden", "true");
      if ("inert" in el) el.inert = true;
    } else {
      el.removeAttribute("aria-hidden");
      if ("inert" in el) el.inert = false;
    }
  });
}

function build(): HTMLElement {
  const el = document.createElement("div");
  el.className = "quiet-lightbox";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "View image");
  el.innerHTML =
    `<button type="button" class="close" aria-label="Close">${CLOSE_ICON}</button>` +
    '<img alt="">';
  el.addEventListener("click", (e) => {
    // Anywhere outside the image itself closes, as does the button.
    if (e.target === el || (e.target as HTMLElement).closest(".close")) close();
  });
  document.body.appendChild(el);
  return el;
}

function close(): void {
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.classList.remove("quiet-lightbox-open");
  setBehind(false);
  lastFocus?.focus();
  lastFocus = null;
}

function open(img: HTMLImageElement): void {
  overlay ??= build();
  const full = overlay.querySelector("img");
  if (!full) return;
  full.src = img.currentSrc || img.src;
  full.alt = img.alt;
  lastFocus = document.activeElement as HTMLElement | null;
  overlay.classList.add("open");
  document.body.classList.add("quiet-lightbox-open");
  setBehind(true);
  overlay.querySelector<HTMLElement>(".close")?.focus();
}

export function initLightbox(): void {
  const body = document.querySelector<HTMLElement>(".quiet-article-body");
  if (!body) return;

  body.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    if (img.closest("a")) return; // author linked it deliberately
    img.classList.add("quiet-zoomable");
    // The cursor advertises this to a pointer; without these it was advertised
    // to nobody else. A picture that opens is a button, so it says so and
    // answers the keys a button answers.
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.addEventListener("click", () => open(img));
    img.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      open(img);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (!overlay?.classList.contains("open")) return;
    if (e.key === "Escape") {
      close();
      return;
    }
    // Only the close button is focusable inside, so Tab has nowhere else to go;
    // holding it there is what keeps the page behind out of reach.
    if (e.key === "Tab") {
      e.preventDefault();
      overlay.querySelector<HTMLElement>(".close")?.focus();
    }
  });
}
