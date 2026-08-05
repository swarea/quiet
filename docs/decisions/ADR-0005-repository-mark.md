# ADR-0005: The repository mark and the social card

## Status

Accepted.

## Context

The README opened with two SVG marks drawn inside this repository — a rail and
four strokes of text, one file per theme. They were placeholders: invented for
this project alone, with no relation to anything else the author publishes.

swarea has since produced an icon set of its own: one square mark, rendered 115
times over a range of accent colours, from which the organisation takes its
avatar and each project takes a variant. Using it makes Quiet look like part of
something. Continuing to draw marks in-repo makes it look like an orphan.

GitHub has no per-repository icon. The two places a mark can actually appear are
the README and the 1280×640 social preview that GitHub unfurls when a link to
the repository is shared. Both had to be built.

## Decision

- **The mark is `docs/assets/mark.png`**, derived from
  `swarea-blue-mid-38548c` in the set: 512×512, corners rounded by the
  proportion `--r-lg` gives a card at the 96px the README displays it.
- **The card ground is `#f2f2f0`**, which is `--light-surface-2` — what the skin
  puts behind a thumbnail. The set shipped 18 slightly different warm whites;
  flattening them to a token rather than to their own average means the value
  belongs to something.

  It was `--light-paper` `#fbfbfa` first, which is the page the mark's frame
  sits on, so the tile dissolved into the page and left only the building. One
  step down makes it a tile instead — and a tile that stops short of white sits
  more comfortably on a dark GitHub theme, where near-white glares.
- **The social card is generated, not assembled**, by
  `scripts/make-social.html`, in the skin's palette and the typeface the skin
  ships. It follows `scripts/make-previews.html`: a served page, a canvas, a
  download.
- **The two in-repo SVGs are deleted.** Keeping a hand-drawn mark beside the
  real one leaves two answers to the same question.

## Why blue, when the organisation is also blue

Measured against the organisation's own card (`swarea-01`, the dark square):

| | hue from the org | accent plane vs its own body |
| --- | --- | --- |
| `blue-mid-38548c` | **0°** | 1.48 |
| `blue-mid-5389e8` | 3° | 3.89 |
| `teal-mid-74cbbd` | 49° | 7.25 |
| `orange-mid-ac792e` | 177° | 3.72 |

Of 115 cards this is the one closest to the parent — the worst pick on the axis
that separates a project from its organisation. It was chosen anyway:

- `--light-accent` is `#38548c`. The mark and the product are the same colour,
  which is a stronger claim than distinctness from a sibling that does not exist
  yet.
- The organisation's card is dark and this one is light. That difference carries
  further at small sizes than 6° of hue.
- There is no surface where the two are shown side by side. GitHub gives a
  repository no icon slot; this mark appears in a README and an unfurled link.

## Consequences

- swarea's house colour is spent on its first project. When a second one
  arrives, Quiet should move rather than the organisation: the palette has
  `--light-warm:#8d632f`, and the set has `orange-mid-8e653f`, which is the same
  colour to within a few steps and sits 177° from the parent. Changing it is one
  file and one re-run of the generator.
- The README carries one mark rather than a `<picture>` pair, so on a dark GitHub
  theme it reads as a light tile rather than adapting. The set has no dark
  variant at this accent, and inventing one would put drawn-here artwork back
  beside the real thing — the situation this decision exists to end. The grey
  ground is as far as this goes towards meeting a dark theme halfway.
- `docs/assets/mark.png` is now an input to a generator, not just a picture in a
  document. Replacing it changes the social card too, and the card has to be
  regenerated when it does.

## Validation

`scripts/check.mjs` reads every `scripts/make-*.html` and asserts each declared
`--light-*` value against `src/styles/tokens.css`. It was checking one generator
by name; the social card would have drifted unwatched. Proved to fail by moving
`--light-muted` two steps in the new file — the gate named the file and the
token.

The ground itself is checked by reading it: a strip across the mark's margin is
one value, `#f2f2f0`, and the card the generator draws is `#fbfbfa` with that
tile on it. Both were measured from the files rather than assumed, because the
first attempt at the grey left 4% of the old white in every pixel of a field
that is supposed to be flat, and it is not visible.
