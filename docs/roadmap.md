# Roadmap

This file is where a release's contents are recorded; GitHub milestones are not
in use ([CONTRIBUTING.md](../CONTRIBUTING.md)). Criteria are completion gates,
not implementation specs — details live in issues.

| Release | State |
| --- | --- |
| 0.1.0 | met, never tagged — it produced nothing installable |
| 0.2.0 | released 2026-07-27 |
| 0.3.0 | released 2026-07-28 |
| 0.5.0 | next |
| 1.0.0 | planned |

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

## 0.5.0 — Beta

- dark mode, auto TOC, reading progress, code copy, related posts
- responsive & accessibility refinement; performance budget measured and set
- visual regression tests; browser matrix pass
- **Done when:** KR/EN mixed content, keyboard nav, mobile screens, and dark
  mode verified on the test blog; known limitations documented.

## 1.0.0 — Stable

- GitHub Release with ZIP, checksums, final preview images
- README install/config/upgrade/rollback guides; changelog; license +
  third-party notices
- **Done when:** installable from the release ZIP alone; test-blog
  verification complete; production-switch checklist (including revert path)
  written; no secrets; no known critical defects.
