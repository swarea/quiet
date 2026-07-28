# Third-party notices

## Pretendard

Copyright (c) 2021 Kil Hyung-jin, with Reserved Font Name Pretendard.
Licensed under the SIL Open Font License 1.1 — <https://scripts.sil.org/OFL>.

This skin ships **a subset of Pretendard under a different name**. The Latin
half of the variable font is cut at build time by `scripts/font.mjs` and shipped
as `images/quiet-latin.woff2` under the family name **Quiet Latin**. The full
licence travels with it as `images/OFL.txt`, and the unmodified source font is
in `src/fonts/source.woff2`.

The rename is required rather than chosen. The OFL reserves the name
"Pretendard", and a subset is a modified version; a modified version may not
carry the reserved name. "Quiet Latin" makes no claim to be Pretendard and
points anyone asking at the licence beside it.

Only Latin is included. Measured from the 1.3.9 release: Latin alone is 51 KB,
Latin with the common Hangul syllables is 821 KB, and the whole font is 2.0 MB.
There is no honest way to guess which of the 11,172 Hangul syllables a blog will
use, so Hangul is left to the reader's own system font — which is what this
typeface was drawn to sit beside, its metrics following the platform default.

Pretendard's own dynamic subset is still requested from jsDelivr, so a blog
written in Korean gets the typeface throughout where that CDN is reachable. It
is no longer load-bearing: with it blocked, Latin still comes from the file in
the package and Hangul from the system stack.

## Build tools

esbuild, Lightning CSS, Nunjucks and subset-font are development dependencies.
None of them ships in the skin package.
