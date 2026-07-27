// Entry point. Each module guards for its own targets and fails independently,
// so one missing feature never blocks the rest or the page content.
import { initTheme } from "./modules/theme";
import { initDrawer } from "./modules/drawer";
import { initCategory } from "./modules/category";
import { initCodeCopy } from "./modules/code-copy";
import { initToc } from "./modules/toc";
import { initScroll } from "./modules/scroll";
import { initReveal } from "./modules/reveal";
import { initSearchShortcut } from "./modules/search";
import { initPrune } from "./modules/prune";
import { initLayout } from "./modules/layout";
import { initConfirmOnce } from "./modules/confirm-once";
import { initContent } from "./modules/content";
import { initLightbox } from "./modules/lightbox";
import { initRelabel } from "./modules/relabel";
import { initSubscribe } from "./modules/subscribe";

const boot = (): void => {
  const steps = [
    initConfirmOnce,
    initLayout,
    initTheme,
    initDrawer,
    initCategory,
    initContent,
    initCodeCopy,
    initLightbox,
    initToc,
    initScroll,
    initReveal,
    initSearchShortcut,
    initPrune,
    initRelabel,
    initSubscribe,
  ];
  for (const step of steps) {
    try {
      step();
    } catch (err) {
      // Isolate failures: log and continue so the rest still initializes.
      console.error("[swarea] module failed:", err);
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
