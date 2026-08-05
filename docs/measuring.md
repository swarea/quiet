# Measuring this skin

Most of what has been fixed here was found by measuring a live blog rather than
by reading the source, and most of the wrong turns were the instrument rather
than the skin. Each entry below cost a false alarm at least once, in one case a
reported defect that did not exist. They are written as symptom first, because
that is how they present.

## The browser pane

**A pane that is not displayed does not composite.** Three things follow, and
they look like bugs.

- `requestAnimationFrame` never fires. Anything gated on a frame appears never
  to run. This is also a real defect class — see the article toolbar in
  [tistory-spec.md](tistory-spec.md) — so the artifact and the bug look alike.
  Tell them apart with a `setTimeout` race: a timer fires, a frame does not.
- **A transition never advances**, so a transitioned property reads its start
  value forever. The contents panel appeared to open while still off-screen: the
  class had landed, the transform had not moved. Disable transitions before
  measuring anything that has one.
- `document.hasFocus()` is false, so **`:focus` never matches** even though
  `document.activeElement` is set. A field's focus border appears not to apply,
  and an `!important` rule appears not to help. `:focus-within` may still match,
  which makes this worse to spot. Check `document.hasFocus()` before concluding
  anything about focus.

Screenshots are unavailable in this state, which is worth saying out loud rather
than reporting measured numbers as though they were seen.

## Changing the theme

**Set `data-theme` and you have bypassed the theme module.** `--on-accent` is
computed in script, from the accent in force, and written to the root as an
inline style — so after a hand-set attribute it is whatever the *previous* theme
needed. Accent-filled buttons then measure as contrast failures: a submit button
read 2.51, and 7.46 through the real toggle. Click `[data-theme-toggle]`.

**Read a colour immediately after a theme change and you read the transition.**
Kill `transition` and `animation` on everything first, or wait past the longest
one. A first sweep this way reported a dozen elements as "fixed in both themes"
that simply had not finished moving.

## Parsing what `getComputedStyle` returns

`color-mix()` computes to **`color(srgb r g b)` with components in 0–1**, not to
`rgb()` in 0–255. A parser that pulls the numbers out and divides by 255 turns a
mid blue into near-black: the comment box's focus ring measured 20.2 when it was
2.34. Handle both forms.

A border colour on a zero-width border is `currentColor`, which is the text
colour and means nothing. Check the width before believing the colour.

## Searching the built files

The build is minified and ASCII-escaped, so **source spellings are not what
ships**. Searching for them gives false negatives, which read as "the fix was
never deployed".

| in source | in `dist` |
| --- | --- |
| `::before` | `:before` |
| `[style*="color"]` | `[style*=color]` |
| `translateX(102%)` | `translate(102%)` |
| `"구독하기"` | `"구독하기"` |

`/images/app.js` 404s when fetched directly on a live blog. Take the bundle's
URL from its `<script>` tag.

## Reading rules off a live page

**Every stylesheet on a Tistory blog is cross-origin, this skin's included** —
it is served from Tistory's CDN. `sheet.cssRules` throws for all of them, so
rules cannot be enumerated from the page. Fetch the stylesheet's text and search
that, remembering the table above.

## Comparing two documents

The reliable way to see what the bundle changes is to load the served HTML in an
iframe with the bundle's `<script>` removed, set the markers `<head>` would have
set, and compare against the booted page.

- **Strip only the bundle.** Leaving it in compares the booted page with itself
  and reports no differences at all, which is easy to mistake for a clean sweep.
- **Pair elements by structural path *and* text.** Pairing by tag and text alone
  collides on every element with empty text; the giveaway is a diff where two
  entries are exact inverses of each other.
- **The iframe's viewport is not the window's.** A width difference of exactly
  the scrollbar gutter is the probe, not the skin. Compare vertical movement,
  which is what "the page shifted" means anyway.

## Writing files from a script

Rewriting a file with Python on Windows makes it CRLF. `.gitattributes` says
`eol=lf` so a checkout restores it, and git normalises on commit — but anything
built in between packages the CRLF version. It cost a release archive whose
checksum did not match the one CI produced, differing in `index.xml` by exactly
one byte per line.

## Asking a page what typeface it has

`document.fonts` reports the **`@font-face` family**, which is the name the
stylesheet gives a file — not the name inside the file. So a page can report

    Quiet Sans / 300 800 / loaded

while the `.woff2` it just loaded calls itself something else entirely in its
own `name` table. That is not a subtle failure: it is how a subset shipped for
three releases still identifying as "Pretendard Variable", under a licence whose
one restriction is on that name, with an ADR recording the rename as verified.

To see what a font is called, read the font: convert the woff2 to sfnt and parse
its `name` table. `scripts/font-rename.mjs` exports `readNames` for exactly this,
and the gate uses it against the built files rather than against any constant in
the build.

Two more from the same family:

- **A width measurement on a block element measures the block.** `div` fills its
  container, so `getBoundingClientRect().width` is the same number whatever the
  typeface. Put a `Range` around the text node instead.
- **Synthesised bold need not be wider.** The browser thickens strokes without
  changing advances, so comparing widths at 400 and 700 can suggest the
  synthesis failed when it did not. Draw both to a canvas and count dark pixels:
  measured here, bold Hangul carries 1.57× the ink at the same width.
