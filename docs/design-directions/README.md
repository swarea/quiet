# Design direction

## Chosen (2026-07-24): "Quiet ink-blue"

After three initial thin prototypes were rejected for reading like wireframes,
we committed to a single, fully-realized direction and built it out.

**Concept.** A quiet, professional reading room. The proven content-blog
architecture — fixed left sidebar with a category tree, a generous reading
column, a scroll-tracking table of contents — delivered with editorial
restraint instead of dashboard density.

**Language.**

- **Color:** a cool off-white ("paper") ground with a single deep ink-blue
  slate accent; a warm counter-neutral held in reserve. Deliberately *not* the
  warm-cream/serif/terracotta look, and not neon developer aesthetics.
- **Type:** system fonts only (no webfont CDN — performance and independence),
  a precise scale, monospace reserved for metadata, dates, and code so
  structure reads at a glance.
- **Layout:** hairlines and whitespace carry the hierarchy; cards are used
  sparingly. Home is a quiet intro → one featured piece → recent list → topic
  lanes (the Bible/Lee/Data-style axes, suggested without hard-coding).
- **Motion:** a restrained page-load rise for the hero, scroll-reveal for
  sections, hover micro-interactions; all disabled under
  `prefers-reduced-motion`.

**Where it lives now.** This direction is implemented in [`../../src`](../../src)
and rendered by the mock preview (`npm run preview`), which is the reference —
run it to see the direction as built. Nothing here depends on a link that can
expire or that points outside the repository.

The three rejected prototypes were removed; they remain in git history if a
past comparison is ever needed.
