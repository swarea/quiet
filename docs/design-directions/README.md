# Design directions

Three deliberately different directions for the first screen and article view.
Open each HTML file in a browser (they are self-contained, system fonts only).
These are *directional prototypes*, not the final design system; the blog
name "swarea" is placeholder branding, not a final decision.

## A — Stillwater (조용한 저널)

- **Concept:** an editorial, text-first journal. Serif display headings, warm
  paper background, hairline rules, zero cards, one deep teal accent.
- **Home:** intro sentence → single featured essay → chronological stream
  (date + category + title) → plain-text topic index.
- **Article:** centered single column (~46rem), serif headings, quiet byline.
- **Mobile:** the same page, stacked; nothing to collapse.
- **Pros:** ages best; strongest fit for "quiet, professional, not tiring";
  faith and personal writing feel native, technical posts stay dignified.
- **Cons:** weakest information density; 512 posts need good category/search
  pages since home shows little; thumbnails almost unused.

## B — Fieldbook (구조적 문서형)

- **Concept:** documentation-inspired. Left category rail, monospace metadata,
  deep green accent, sticky header, dense readable rows.
- **Home:** intro + "start here" strip → recent rows with category crumbs and
  2-line summaries; the category rail is always present on desktop.
- **Article:** body column + sticky "On this page" TOC rail.
- **Mobile:** rail collapses above content; TOC hidden behind a toggle.
- **Pros:** best navigation for a 500+ post technical archive; TOC/structure
  serve long documents; feels professional to developer readers.
- **Cons:** most "tool-like" — personal essays and meditations read colder;
  rail + sticky chrome is the most UI to maintain.

## C — Ledger (에디토리얼 그리드)

- **Concept:** magazine energy. Heavy masthead rules, large headlines, burgundy
  accent, topic lanes, selective thumbnails (must survive their absence).
- **Home:** text-led hero feature → three topic lanes → 2-col recent grid.
- **Article:** centered head, roomy serif-flavored body.
- **Mobile:** everything stacks to one column; hero image drops first.
- **Pros:** most distinctive identity; topic lanes express Bible/Lee/Data-style
  axes without hard-coding them; showcases featured writing well.
- **Cons:** highest visual temperature — furthest from "quiet"; grid quality
  depends on summaries/thumbnails existing; most layout edge cases.

## Recommendation

**A (Stillwater) as the base identity, adopting B's article-page structure**
(sticky TOC rail on wide screens, category crumbs) for long technical posts.
Rationale: the product principles rank reading and quietness above density;
A is the only direction that fully embodies them, and its weakness (archive
navigation) is exactly what B's article/TOC patterns and strong list pages
solve. C's lane idea can inform the home cover configuration later without
importing its visual temperature.

Decision state: **open** — awaiting owner's choice before any full style
implementation. Record the final choice here and close the corresponding
`type:decision` issue.
