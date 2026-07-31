# ADR-0004 — Bundle Hangul too, and stop calling the CDN

**Status:** accepted, 2026-07-31. Supersedes the Latin-only half of
[ADR-0003](ADR-0003-bundled-latin.md); the rename and the licence handling it
decided still stand.

## Context

ADR-0003 cut the Latin half of Pretendard into the package and left Hangul to the
reader's system font. The reasoning was that Korean is irreducible in one file,
and that the fallback is a fair substitute because Pretendard's metrics follow
Apple SD Gothic Neo — so on Apple hardware the reader sees something close to the
thing the typeface imitates.

That left the skin doing both jobs at once. It carried the obligations of
redistribution — the rename the OFL requires, the licence travelling in the
package — while still asking jsDelivr for Pretendard's dynamic subset on every
page load, so the design still depended on a third party staying up and every
reader's address still went to one.

The fallback argument rested on an audience that is mostly on Apple hardware or
Android, which is to say mostly on phones. That was assumed, not measured.

## Decision

Bundle Hangul as well, and remove the jsDelivr request entirely.

The family is renamed from **Quiet Latin** to **Quiet Sans**, because a file
holding 11,172 Hangul syllables is not a Latin subset and should not be called
one. The OFL rename requirement is met either way.

## Why

**The audience is not the one the fallback was chosen for.** Measured on the live
blog: **91.4% of readers are on a desktop**, 8.6% on mobile. In Korea a desktop
overwhelmingly means Windows, which means Malgun Gothic — visibly older than the
rest of the page, and it would have been what nearly every reader saw for nearly
all of the text, since most of the blog is in Korean.

**The cost is smaller than recorded.** ADR-0003 put Latin-plus-Hangul at 821 KB
from an external measurement. Cut here at build time it is **596 KB**, and the
package goes from 338 KB to 900 KB — 4.4% of Tistory's 20 MB limit.

Narrowing the weight axis to 400–700 was tried and makes the file *larger*, at
1152 KB: a narrower range has to interpolate new masters where the wider one can
keep the ones already in the file. The 300–800 range stays.

**`font-display: swap` bounds the cost.** A first visit paints in the system
stack and swaps when the file lands, so the page is readable immediately either
way. What the reader pays is one 596 KB download, cached afterwards, on an
audience that is 91% desktop.

## Consequences

- No host outside Tistory is contacted for anything. The skin's design no longer
  depends on a third party's uptime, and no reader's address leaves for a font.
- The `unicode-range` on the `@font-face` is gone. It existed to keep a page with
  no Latin from asking for the file, which saves nothing once the file covers the
  script the blog is mostly written in — and left as it was, it would have kept
  the browser from using the font for Hangul at all.
- The package is 900 KB. A blogger uploads a 596 KB font by hand, which is slower
  than a 51 KB one.
- Mobile readers, 8.6% here, pay the most for a fallback that was already good on
  their platform. That is the trade this decision makes deliberately: 8.6% pay so
  that 91.4% see the page as it was drawn.
- Reversible. Nothing about the settings surface changes, so returning to
  Latin-only is a minor release rather than a breaking one.
