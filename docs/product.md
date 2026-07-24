# Product

An original Tistory skin, designed and built from scratch for a long-term personal blog.

## Who this is for

The blog records, over years, in Korean and English:

- development and technical learning
- personal projects and their trial-and-error
- generalizable lessons from professional work
- preparation for working abroad as a developer, and English learning
- thoughts on career and life
- faith and scripture meditation
- data-driven analysis and records

The owner's personal brand is **swarea**. The blog's three identity axes under
consideration are **Bible / Lee / Data**, but names for menus, categories, and
the blog title are *not final*. The skin must not hard-code them; they are
managed through Tistory categories, covers, and skin variables.

## Design impression (non-negotiable)

- quiet, modern, professional; does not tire the eye over years
- a developer blog that does not lean on hacker/neon aesthetics
- carries faith content without looking like a typical religious site
- personal writing and technical documents coexist naturally
- no wall-to-wall cards or dashboard layouts
- the reading experience outranks visual decoration

## Product principles (priority order for all decisions)

1. **Content first** — navigation, cards, and badges never outshine the content.
2. **Reading first** — long technical docs, meditations, short diary posts, and
   image-heavy posts must all read comfortably.
3. **Progressive enhancement** — with JS delayed or failed, reading, menu and
   category navigation, search, paging, and comments access still work.
   JS only *enhances* (theme toggle, TOC, reading progress, code copy).
   No full-screen loader, ever.
4. **Original identity** — no layout/structure recognizably cloned from another
   skin (see [tistory-spec.md](tistory-spec.md) clean-room note).
5. **Maintainability** — human-readable templates/styles/scripts; only the build
   output is in Tistory's format.
6. **Accessibility** — WCAG 2.2 AA as a floor, designed in from the start.
7. **Performance** — no external CDN or runtime framework dependencies for core
   function; defer what the first screen does not need.
8. **Configurability** — meaningful options via Tistory skin variables only;
   every option must earn its place.
9. **Honest validation** — mock-preview pass and real-Tistory pass are reported
   separately; nothing is claimed "works on Tistory" until verified on a test blog.

## Screens in scope

Global header · home (editorial cover) · post lists (category / search / tag /
archive / empty states) · article detail (the most important screen) · pages ·
notices · protected posts · comments and replies · guestbook · tag index ·
search · sidebar (Tistory widget-compatible) · footer · pagination · dark mode.

Detailed per-screen requirements live in the issues that implement them, not
here. Tistory platform constraints live in [tistory-spec.md](tistory-spec.md).
