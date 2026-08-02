# Design direction

## Chosen (2026-07-24): "Quiet ink-blue"

After three initial thin prototypes were rejected for reading like wireframes,
a single, fully-realized direction was committed to and built out.

**Concept.** A quiet, professional reading room. The conventional content-blog
architecture — fixed left sidebar with a category tree, a generous reading
column, a scroll-tracking table of contents — delivered with editorial
restraint instead of dashboard density.

**Language.**

- **Color:** a cool off-white ("paper") ground with a single deep ink-blue
  slate accent; a warm counter-neutral held in reserve. Deliberately *not* the
  warm-cream/serif/terracotta look, and not neon developer aesthetics.
- **Type:** superseded by [ADR-0004](../decisions/ADR-0004-bundled-hangul.md).
  This direction was set with system fonts only; the face is now bundled with
  the package, Latin and Hangul both, and nothing is fetched from another host.
  The rest holds: a precise scale, monospace reserved for metadata, dates, and
  code so structure reads at a glance.
- **Layout:** hairlines and whitespace carry the hierarchy; cards are used
  sparingly. Home is a quiet intro → one featured piece → recent list → a grid
  of posts (every label drawn from the blog's own categories, never hard-coded).
  The grid was designed as lanes, one per category, until a live blog showed
  Tistory repeats a cover item and offers no way to group them.
- **Motion:** a restrained page-load rise for the hero, scroll-reveal for
  sections, hover micro-interactions; all disabled under
  `prefers-reduced-motion`.

**Where it lives now.** This direction is implemented in [`../../src`](../../src)
and rendered by the mock preview (`npm run preview`), which is the reference —
run it to see the direction as built. Nothing here depends on a link that can
expire or that points outside the repository.

The three rejected prototypes were removed; they remain in git history if a
past comparison is ever needed.
