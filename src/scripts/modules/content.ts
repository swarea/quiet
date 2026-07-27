// Upgrades the markup the Tistory editor produces so it matches the rest of the
// skin. Everything here is an enhancement: the styles in content.css already
// make bare editor output presentable, so a failure leaves the article readable.
const COPY_ICON =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

// Language hints the editor leaves behind, in order of reliability.
function languageOf(pre: HTMLElement): string {
  const attr = pre.getAttribute("data-ke-language") ?? pre.getAttribute("data-language");
  if (attr) return attr;
  const cls = Array.from(pre.classList).find(
    (c) => !/^(ke-|tt-|prettyprint|linenums)/.test(c),
  );
  return cls ?? "code";
}

function frameCodeBlocks(body: HTMLElement): void {
  body.querySelectorAll<HTMLElement>("pre").forEach((pre) => {
    if (pre.closest(".sw-code")) return; // already framed

    const frame = document.createElement("div");
    frame.className = "sw-code";
    const bar = document.createElement("div");
    bar.className = "bar";

    const lang = document.createElement("span");
    lang.className = "lang";
    lang.textContent = languageOf(pre);

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy";
    copy.setAttribute("data-copy", "");
    copy.innerHTML = `${COPY_ICON}<span>Copy</span>`;

    bar.append(lang, copy);
    pre.parentNode?.insertBefore(frame, pre);
    frame.append(bar, pre);
  });
}

// A wide table must scroll inside its own box, never take the page sideways.
function wrapTables(body: HTMLElement): void {
  body.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
    if (table.closest(".sw-tbl-wrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "sw-tbl-wrap";
    table.parentNode?.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
}

// Links the editor opens in a new tab should not hand the opener over.
function secureExternalLinks(body: HTMLElement): void {
  body.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]').forEach((a) => {
    const rel = new Set((a.getAttribute("rel") ?? "").split(/\s+/).filter(Boolean));
    rel.add("noopener");
    rel.add("noreferrer");
    a.setAttribute("rel", [...rel].join(" "));
  });
}

export function initContent(): void {
  const body = document.querySelector<HTMLElement>(".sw-article-body");
  if (!body) return;
  frameCodeBlocks(body);
  wrapTables(body);
  secureExternalLinks(body);
}
