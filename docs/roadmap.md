# Roadmap

This file is where a release's contents are recorded; GitHub milestones are not
in use ([CONTRIBUTING.md](../CONTRIBUTING.md)). Criteria are completion gates,
not implementation specs — details live in issues.

| Release | State |
| --- | --- |
| 0.1.0 | met, never tagged — it produced nothing installable |
| 0.2.0 | released 2026-07-27 |
| 0.3.0 | released 2026-07-28 |
| 0.4.0 | released 2026-07-30 |
| 0.5.0 | released 2026-07-31 |
| 1.0.0 | next |

## 0.1.0 — Foundation

Never released. Everything below was built, but a skin with no installable
package is nothing a blogger can put on a blog, so the first tag is 0.2.0.

- product goals and clean-room principles documented
- design direction chosen from three distinct proposals (recorded)
- repository governance: CONTRIBUTING, issue/PR templates
- build architecture decided (ADR-0001) and scaffolded
- local mock preview renders at least: home, one list, one article page
- base design tokens (light/dark, same semantic names)
- single validation gate (`scripts/check.mjs`) wired into CI
- **Done when:** clean clone installs and builds; ≥3 mock pages render on
  mobile + desktop; basic a11y smoke passes; everything not yet verified on
  real Tistory is explicitly marked as such.

## 0.2.0 — Tistory functional

- real `skin.html`, `style.css`, `index.xml` with all major substitution
  variables: covers, lists, article, search, tag, notice, page, protected,
  comments, guestbook, sidebar, paging
- installable ZIP with official preview images
- **Done when:** uploaded to a *test* blog; core screens smoke-tested there;
  no token corruption; install/rollback documented.

## 0.3.0 — Audited

- every screen opened on a live blog in both themes, and in a second browser
- the Latin typeface bundled with the package rather than fetched
- page language declared per page rather than per blog
- the validation gate running on every push and pull request, and after the
  build during a release
- **Done when:** no page renders without a heading or a landmark; nothing the
  documentation claims is contradicted by the code; the gate passes in CI.

## 0.4.0 — Audit follow-up

Not planned. It exists because auditing 0.3.0 on a live blog produced more
defects than a patch release could carry quietly, and holding them back to
bundle with 0.5.0's features would have left a released version standing with
known faults in it.

- the home covers: one left edge, rhythm by position, the Introduction image,
  the Topics grid, and the Introduction cover surviving a post list
- a category names the branch it hangs off, written the way Tistory writes it
- a theme change no longer leaves elements holding the previous theme's colours
- public documentation reviewed for overclaims, third-party characterisation
  and trademark use
- **Done when:** every page type passes the sweep in both themes on a live blog
  and in the preview; the gate covers each defect class found.

## 0.5.0 — Beta

Planned as the feature milestone; what it became was the release that stopped
the page moving. Reading a live blog rather than a preview turned up a class of
defect a preview cannot show: everything the skin has to correct *after* the
page has been painted, because the correction rides a deferred bundle.

- dark mode, auto TOC, reading progress, code copy, related posts
- nothing the reader sees changes under them once the page is drawn: the
  author's carried colours, Tistory's own wording, and the room a code block or
  a table is about to need are all settled before the first paint
- the reading column is one width on every page, whatever the scrollbar does
- Tistory's own components are read in both themes even where this skin hides
  them, because hiding them is something the bundle does and the fallback is a
  promise
- one name per thing, in the words the reader uses
- **Done when:** KR/EN mixed content and dark mode verified on the test blog;
  known limitations documented. **Met.** Dark mode was reviewed by the blog
  owner on live posts, not only measured.

**Not met, and deliberately carried to 1.0.0** rather than quietly dropped:
keyboard navigation, mobile screens, the browser matrix and visual regression.
Three of those need real browsers on real hardware; none of them is a feature,
and none was going to be finished by holding this release. A version that
claims stability should be the one that has them.

## 1.0.0 — Stable

- GitHub Release with ZIP, checksums, final preview images
- README install/config/upgrade/rollback guides; changelog; license +
  third-party notices
- keyboard navigation, mobile screens, the browser matrix and visual
  regression, carried here from 0.5.0
- **Done when:** installable from the release ZIP alone; test-blog
  verification complete; production-switch checklist (including revert path)
  written; no secrets; no known critical defects.

The version number is the thing being decided here, not the feature list. 1.0.0
says the settings surface is frozen — a variable renamed after it is a breaking
change. Three labels were renamed in 0.5.0, which is exactly the kind of thing
one more round of real use tends to turn up, so the freeze waits for that round
rather than being declared alongside it.
