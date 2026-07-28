# ADR-0003: Bundle the Latin typeface with the skin

## Status

Accepted. Supersedes the delivery decision in
[ADR-0002](ADR-0002-typeface.md); the typeface choice there stands.

## Context

ADR-0002 chose Pretendard and delivered it from jsDelivr, and closed by saying
the decision would be superseded rather than reversed if self-hosting became
possible. Two things that were unknown then are now measured.

**Tistory accepts arbitrary files in the skin package.** A `.woff2` uploaded
under `images/` is stored and served like any other skin file. This was the
blocker; without it nothing below is possible.

**Korean is the whole of the cost.** Cut from the 1.3.9 release:

| Coverage | Size |
| --- | --- |
| Latin, Latin-1, Latin Extended-A, punctuation | 51 KB |
| the above plus the common Hangul syllables | 821 KB |
| the whole variable font | 2,009 KB |

There are 11,172 Hangul syllables and no honest way to predict which of them a
blog will use, which is why the upstream distribution splits the font into 92
files by unicode range and lets the browser fetch only what a page needs. A
single self-hosted file cannot do that.

## Decision

**Ship the Latin half; leave Hangul to the reader's system.**

- `scripts/font.mjs` cuts Latin, Latin-1, Latin Extended-A and the punctuation
  a post reaches for out of the full variable font at build time, and the build
  writes it to `images/quiet-latin.woff2` — 51 KB, variable weight 300–800.
- The `@font-face` carries a `unicode-range`, so a page with no Latin on it
  never asks for the file.
- Hangul falls through to the system stack, which is what this typeface was
  drawn to sit beside: its metrics follow the platform default it was designed
  against, so Latin from us and Hangul from the system is a pairing the
  typeface expects rather than an accident of fallback.
- **The family is renamed to "Quiet Latin".** Pretendard is OFL 1.1 with a
  Reserved Font Name and a subset is a modified version; a modified version may
  not carry the reserved name. `images/OFL.txt` travels with the file.
- The jsDelivr subset stays in the stack for Hangul, demoted from dependency to
  nicety: with it blocked, Latin still comes from the package and Hangul from
  the system.

## Alternatives considered

- **Bundle all 92 subset files** — 3.2 MB in the package, uploaded by hand
  through the skin editor and re-uploaded on every version bump; rejected.
- **Bundle the unsubset font** — one file of 2.0 MB that every reader downloads
  in full to render a page needing 51 KB of it; rejected.
- **Cut our own Hangul subset** — 821 KB for a guess at which syllables matter,
  and the coverage becomes ours to get wrong; rejected.
- **Keep the CDN as the only source** — the position ADR-0002 took, and the one
  this replaces. It was correct while the package could not hold a font.

## Consequences

- The design's letters no longer depend on a third party staying up. This was
  the stated worry and it is answered for Latin, which is the whole of the
  skin's own interface and of any post written in English.
- A Korean post rendered with the CDN blocked pairs our Latin with the reader's
  system Hangul. Readable, and visibly different from Pretendard throughout.
- The package grows by 51 KB, to 244 KB total against Tistory's 20 MB limit.
- The build gains one dependency, `subset-font`, which wraps harfbuzz as wasm
  and needs no toolchain outside Node.
- The repository carries the 2 MB source font so a clean clone can rebuild the
  subset without a network fetch.

## Validation

- Verified on the live blog: the face registers as `Quiet Latin`, status
  `loaded`, weight 300–800, served from the blog's own domain.
- Latin measured through `var(--sans)` matches the face addressed directly and
  differs from the generic sans-serif, so the file is the one rendering.
- Hangul measured through the same stack matches neither, so it falls through
  as intended.
