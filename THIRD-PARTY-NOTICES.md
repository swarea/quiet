# Third-party notices

## Pretendard

Copyright (c) 2021 Kil Hyung-jin, with Reserved Font Name Pretendard.
Licensed under the SIL Open Font License 1.1 — <https://scripts.sil.org/OFL>.

This skin ships **a subset of Pretendard under a different name**. It is cut at
build time by `scripts/font.mjs` into two files under the family name
**Quiet Sans** — `images/quiet-sans-latin.woff2` and
`images/quiet-sans-hangul.woff2`. The full licence travels with them as
`images/OFL.txt`, and the unmodified source font is in `src/fonts/source.woff2`.

The rename is required rather than chosen. The OFL reserves the name
"Pretendard", and a subset is a modified version; a modified version may not
carry the reserved name. "Quiet Sans" makes no claim to be Pretendard and
points anyone asking at the licence beside it.

The rename is in the files, not only in the stylesheet — the family, the full
name, the PostScript name and the unique id inside each `.woff2` all read
"Quiet Sans". It was not always so: up to 1.0.1 the only rename was the
`@font-face` declaration, which names the file rather than the font, and the
shipped subsets still identified themselves as "Pretendard Variable". A gate
check now reads the built files back and refuses a package whose typeface
presents the reserved name.

What is *not* renamed is the credit. The copyright record still names Kil
Hyung-jin, and the licence and its url now travel inside the font as well as
beside it. The restriction is on the name the font presents; the attribution is
the part the licence asks to keep.

Latin and Hangul are both included, split into two files because the weight axis
costs almost nothing for one and almost everything for the other. Measured at
build against the source font's 2.0 MB:

| | variable axis | static 400 |
| --- | --- | --- |
| Latin | **53 KB** | 27 KB |
| Hangul | 1663 KB | **568 KB** |

So Latin keeps a live 300–800 axis and Hangul ships as one static instance at
400, with bold synthesised from it. Hangul is taken entire — all 11,172
syllables — because there is no honest way to guess which of them a blog will
use, and a subset guessed from today's posts is a gap in tomorrow's.

Each file carries a `unicode-range`, so a page with no Korean on it never asks
for the 568 KB.

**Nothing is fetched from another host.** Pretendard's dynamic subset was
requested from jsDelivr until 0.5.0; see
[ADR-0004](docs/decisions/ADR-0004-bundled-hangul.md) for why that stopped.

## This skin's own licence

MIT, and it ships with the package rather than only living in the repository:
`images/LICENSE.txt`, beside the typeface's. `style.css` and `images/app.js`
each open with a one-line notice, because Tistory serves both to readers as they
are.

## Build tools

esbuild, Lightning CSS, Nunjucks and subset-font are development dependencies.
None of them ships in the skin package.
