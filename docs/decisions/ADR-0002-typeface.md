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
