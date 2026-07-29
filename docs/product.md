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

The skin is **Quiet**; the author is **swarea**. No menu name, category name,
blog title, or tagline belongs in the skin. Every one of them is the blogger's
to choose, and the skin reads them from Tistory categories, covers, and skin
variables. A skin that ships one blogger's words makes every other blogger wear
them.

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
   category navigation, paging, and reading existing comments still work.
   JS only *enhances* (theme toggle, TOC, reading progress, code copy).
   No full-screen loader, ever.
   Two things are outside this and cannot be brought inside it: search and
   posting a comment are driven by Tistory's own scripts, which a skin does
   not replace.
4. **Original identity** — no layout/structure recognizably cloned from another
   skin (see [tistory-spec.md](tistory-spec.md) clean-room note).
5. **Maintainability** — human-readable templates/styles/scripts; only the build
   output is in Tistory's format.
6. **Accessibility** — WCAG 2.2 AA as a floor, designed in from the start.
7. **Performance** — no runtime framework, and no external dependency the design
   needs to be correct. The Latin typeface is bundled; the CDN copy of the same
   family covers Hangul and is optional. Defer what the first screen does not
   need.
8. **Configurability** — meaningful options via Tistory skin variables only;
   every option must earn its place.
9. **Honest validation** — mock-preview pass and real-Tistory pass are reported
   separately; nothing is claimed "works on Tistory" until verified on a test blog.

## Interaction rules

Four rules settle most questions about how an element should behave. Each was
arrived at by trying the alternatives; the rejected options and the reasons are
recorded in the stylesheet beside the rules they produced.

1. **Text that is read carries full contrast from the start.** Post titles,
   headings and titles in a list do not change on hover.
2. **Text that is clicked rests one step lighter and darkens on hover.** Sidebar
   links carry no underline and no colour of their own, so without this they are
   indistinguishable from the section labels beside them.
3. **Hover changes colour and nothing else.** No transform, no weight change, no
   underline, no background fill. Buttons scale down on press; elements that
   open or arrive may animate. All animation respects `prefers-reduced-motion`.

   The test, when "no background fill" is argued about: **hover may change the
   colour of a surface that is already painted; it may not paint a surface that
   was not there.** A submit button is already a filled shape and may darken. A
   page number, a copy button and a subscribe pill are not, and get their colour
   changed instead. A table row is neither — it is read, not aimed at — so it
   does nothing at all.
4. **The accent colour is used in three places:** links within prose, category
   labels, and the comment submit button. Elsewhere emphasis is a step within a
   single neutral scale.

## Screens in scope

Global header · home (editorial cover) · post lists (category / search / tag /
archive / empty states) · article detail (the most important screen) · pages ·
notices · protected posts · comments and replies · guestbook · tag index ·
search · sidebar (Tistory widget-compatible) · footer · pagination · dark mode.

Detailed per-screen requirements live in the issues that implement them, not
here. Tistory platform constraints live in [tistory-spec.md](tistory-spec.md).
