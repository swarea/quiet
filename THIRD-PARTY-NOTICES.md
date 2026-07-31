# Third-party notices

## Pretendard

Copyright (c) 2021 Kil Hyung-jin, with Reserved Font Name Pretendard.
Licensed under the SIL Open Font License 1.1 — <https://scripts.sil.org/OFL>.

This skin ships **a subset of Pretendard under a different name**. It is cut at
build time by `scripts/font.mjs` and shipped as `images/quiet-sans.woff2` under
the family name **Quiet Sans**. The full licence travels with it as
`images/OFL.txt`, and the unmodified source font is in `src/fonts/source.woff2`.

The rename is required rather than chosen. The OFL reserves the name
"Pretendard", and a subset is a modified version; a modified version may not
carry the reserved name. "Quiet Sans" makes no claim to be Pretendard and
points anyone asking at the licence beside it.

Latin and Hangul are both included, at 596 KB against the source font's 2.0 MB.
Hangul is taken entire — all 11,172 syllables — because there is no honest way to
guess which of them a blog will use, and a subset guessed from today's posts is a
gap in tomorrow's. Narrowing the weight axis makes the file larger rather than
smaller: 400–700 measured 1152 KB, because a narrower range has to interpolate
new masters where the wider one keeps the ones already in the file.

**Nothing is fetched from another host.** Pretendard's dynamic subset was
requested from jsDelivr until 0.5.0; see
[ADR-0004](docs/decisions/ADR-0004-bundled-hangul.md) for why that stopped.

## Build tools

esbuild, Lightning CSS, Nunjucks and subset-font are development dependencies.
None of them ships in the skin package.
