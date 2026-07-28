# ADR-0002: Typeface delivery

## Status

Accepted

## Context

The skin shipped with a system-font stack only. On Windows that resolves to
Malgun Gothic, whose Korean rendering is noticeably lighter and less even than
the design intends; the "quiet and professional" impression depends heavily on
the text itself, since the layout deliberately carries no decoration. macOS and
iOS resolve to Apple SD Gothic Neo and look close to the intended design, so
the problem is platform-dependent and most visible to the audience on Windows.

Korean webfonts are large — a full Hangul face is megabytes — which is why
`docs/product.md` puts system fonts first and requires a licence, weight,
loading-strategy and failure review before adopting one.

## Decision

Request **Pretendard** at runtime, keeping the system stack as the fallback.

- **Licence:** SIL Open Font License 1.1. Free for web use, no attribution
  required in the UI; recorded in `THIRD-PARTY-NOTICES.md` anyway.
- **Weight:** the *dynamic subset* build splits the face across unicode-range
  slices, so a browser downloads only the ranges a page actually paints —
  typically tens of KB for a Korean article, not megabytes.
- **Loading:** the stylesheet is attached with `media="print"` and switched to
  `all` on load, so it never blocks first paint. A `<noscript>` copy covers
  readers without JavaScript.
- **Failure:** if jsDelivr is slow or unreachable nothing waits on it and the
  page renders in `--sans`, which already lists the full system stack after
  Pretendard. No layout shift beyond the normal font swap.
- **Not bundled:** Tistory's 20 MB skin budget could hold a subset, but
  building one needs font tooling we do not have in the pipeline, and a
  hand-made subset would silently drop glyphs for rarer Hangul syllables.

## Alternatives considered

- **System fonts only** — zero requests and no third-party dependency, but
  leaves the Windows reading experience visibly worse than the design.
- **Google Fonts (Noto Sans KR)** — comparable quality, but a heavier request
  chain and a third-party the reader may not expect; Pretendard's dynamic
  subset is smaller in practice.
- **Self-host a subset in `images/`** — best privacy and no external
  dependency; revisit once the build can subset fonts reproducibly.

## Consequences

- One external host is contacted on page load. This is the skin's only
  third-party request, and the only one permitted: core reading, navigation,
  search and comments must never depend on it.
- Readers see a brief system-font paint before the swap on a cold cache.
- If self-hosting becomes possible this decision is superseded, not reversed —
  the `--sans` stack already names Pretendard first either way.

## Validation

- `scripts/check.mjs` keeps the token and structure gates green.
- Verified on the test blog that the page renders immediately and the face
  swaps in, and that blocking the CDN still leaves the skin fully usable.

## What self-hosting would actually cost

Measured on the live blog, so the question does not have to be reopened from
memory.

The dynamic subset declares **92 `@font-face` blocks, one per unicode range**,
each backed by its own file of roughly 34-37 KB. An article page in Korean and
English downloaded **three of them, about 107 KB**. The rest are never fetched
because no glyph on the page falls in their range.

Bundling means choosing between three bad shapes:

- **All 92 files** — about 3.2 MB in the package, uploaded by hand through the
  skin editor, and re-uploaded on every version bump.
- **The single unsubset variable font** — one file of roughly 1.2 MB, which
  every reader downloads in full to render a page that needed 107 KB.
- **Subsetting ourselves** — the only sensible size, but it adds a Python
  toolchain to a build that currently needs only Node, and it means shipping a
  font we cut, whose coverage is then ours to get wrong.

The licence permits redistribution (OFL 1.1), so this is a cost question rather
than a permission one, and the cost is worse than the risk it buys off. If the
CDN goes away the skin falls back to a system stack that covers Korean and Latin
on every target platform; the design changes, nothing breaks. Revisit if Tistory
ever allows uploading arbitrary files, which would remove the hand-upload
objection but not the size one.
