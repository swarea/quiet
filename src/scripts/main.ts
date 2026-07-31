// Entry point. Each module guards for its own targets and fails independently,
// so one missing feature never blocks the rest or the page content.
import { initTheme } from "./modules/theme";
import { initDrawer } from "./modules/drawer";
import { initCategory } from "./modules/category";
import { initCurrent } from "./modules/current";
import { initCodeCopy } from "./modules/code-copy";
import { initToc } from "./modules/toc";
import { initScroll } from "./modules/scroll";
import { initReveal } from "./modules/reveal";
import { initSearchShortcut } from "./modules/search";
import { initPrune } from "./modules/prune";
import { initLayout } from "./modules/layout";
import { initConfirmOnce } from "./modules/confirm-once";
import { initContent } from "./modules/content";
import { initInk } from "./modules/ink";
import { initLightbox } from "./modules/lightbox";
import { initRelabel } from "./modules/relabel";
import { initSubscribe } from "./modules/subscribe";
import { initLang } from "./modules/lang";
import { initLineage } from "./modules/lineage";
import { initMasthead } from "./modules/masthead";

// Two of these are load-bearing for the layout: the stylesheet folds the
// category tree and slides the rail off the edge on the strength of the bundle
// being here, and only these two can undo either. If one of them fails, the
// marker must not be set -- the layout has to fall back to the one that needs
// no scripting, or a reader is left with a sidebar and a tree that cannot open.
const STEPS: ReadonlyArray<readonly [() => void, boolean]> = [
  [initConfirmOnce, false],
  [initLayout, false],
  [initTheme, false],
  [initDrawer, true],
  [initCategory, true],
  [initCurrent, false],
  [initContent, false],
  [initInk, false],
  [initCodeCopy, false],
  [initLightbox, false],
  [initToc, false],
  [initScroll, false],
  [initReveal, false],
  [initSearchShortcut, false],
  [initPrune, false],
  [initRelabel, false],
  [initSubscribe, false],
  [initLang, false],
  [initLineage, false],
  [initMasthead, false],
];

const boot = (): void => {
  let opensWhatCssHid = true;

  for (const [step, revealsHiddenLayout] of STEPS) {
    try {
      step();
    } catch (err) {
      // Isolate failures: log and continue so the rest still initializes.
      console.error("[swarea] module failed:", err);
      if (revealsHiddenLayout) opensWhatCssHid = false;
    }
  }

  // Set last, and only on the strength of what actually ran. Set first, it
  // attested that the bundle had parsed -- which the page could already see --
  // rather than that anything had initialised.
  if (opensWhatCssHid) {
    document.documentElement.setAttribute("data-quiet-ready", "");
  } else {
    document.documentElement.classList.remove("quiet-js");
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
