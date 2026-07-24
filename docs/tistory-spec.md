# Tistory platform constraints

Decisions and constraints that drive implementation. Source: official skin guide
(<https://tistory.github.io/document-tistory-skin/>), verified 2026-07-24.
Anything *not* confirmed against the official guide is marked **unverified** and
must be validated on the test blog before release.

## Clean-room principle

We inspected an existing skin (hELLO-family `skin.html`/CSS) **only** to build a
feature inventory and find pain points. No HTML structure, Tailwind class
combinations, bundled JS, icons, assets, or design expressions are copied. All
substitution variables are re-verified against the official documentation. The
final implementation is independent, original code.

## Required package structure (official)

```
skin.html        — template; substitution variables + <s_*> block tags
style.css        — editable in Tistory's skin editor
index.xml        — skin metadata + settings; REQUIRED
images/          — all non-required assets (scripts, icons, etc.)
preview.gif      — 112×84   (fallback preview)
preview256.jpg   — 256×192  (active-skin preview)
preview560.jpg   — 560×420  (skin list)
preview1600.jpg  — 1600×1200 (detail view)
```

## index.xml — key facts

- Holds `<information>` (name/version/description/license), `<author>`,
  `<default>` (counts, truncation lengths, `contentWidth`, category tree
  colors, comment/guestbook counts), cover definitions, `<variablegroup>`
  skin variables, and list-style settings.
- **Changing index.xml resets user skin settings** (official warning). Design
  variable names once, keep them stable across versions; treat renames as
  breaking changes documented in the changelog.
- `contentWidth` also controls the editor's WYSIWYG width — keep it equal to
  the article body width so authoring matches rendering.

## Skin variables

Five types: `STRING`, `SELECT` (JSON options), `IMAGE`, `COLOR`, `BOOL`.
Referenced as `[##_var_{name}_##]`, conditionally as `<s_if_var_{name}>` /
`<s_not_var_{name}>`. Variable names: ASCII kebab-case, stable forever.

## Covers

- Defined in `index.xml` `<cover>`; undefined cover names in the template are
  ignored (safe to ship more cover types than a user enables).
- Two data sources: `RECENT` (latest posts, count 1–100, per category or
  notices) and `CUSTOM` (manual title/summary/URL/thumbnail).
- Template: `<s_cover_group>` → `<s_cover_rep>` → `<s_cover name="...">` →
  `<s_cover_item>`; `<s_cover_item_article_info>` vs
  `<s_cover_item_not_article_info>` distinguish article/non-article items.
- Cover items may arrive with empty title/summary/thumbnail or very long
  titles — every cover layout must survive that.

## Template rules that constrain the build pipeline

- `[##_..._##]` tokens and `<s_*>`/`</s_*>` pseudo-tags must pass through the
  build **byte-identical**. HTML minifiers/formatters that reorder or "fix"
  unknown tags are banned from the pipeline; validation asserts token
  preservation (see `scripts/` gate, issue for 0.1.0).
- `<s_*>` tags are invalid HTML to standard validators — validation must
  allowlist official Tistory syntax and still catch *real* HTML errors.
- The editor generates its own body HTML (figures, code blocks, tables,
  embeds). Body styling targets that generated markup; **exact class names
  used by the current editor are unverified** until inspected on the test
  blog (0.2.0 task).

## Known open questions (verify on test blog, 0.2.0)

- Exact behavior of comment/guestbook substitution IDs (duplicate-ID risk noted
  in the reference skin: it reuses `id="text"`, `id="name"` etc. in both the
  comment and guestbook forms — our implementation must not).
- Toolbar/subscribe button integration markup currently required.
- Whether `index.xml` *additions* (new variables) also reset settings, or only
  modifications/renames.
- Search URL format and `[##_search_..._##]` behavior on list pages.

## Feature inventory taken from the reference skin (behavior only)

Home covers (list/grid/zigzag/slideshow) · sidebar with profile, counter,
search, category, blog menu, notices, popular/recent posts, tags, recent
comments · article with TOC + scrollspy, related posts, tag labels, author box
· comments/guestbook with nested replies and secret flag · protected post form
· tag cloud grid · paging · dark mode with pre-hydration flash guard · reading
progress indicator.

Pain points observed (to fix, not to copy): full-screen loader blocks content;
content hidden behind JS templates (`x-teleport`) so a JS failure blanks the
article; external CDN dependencies for fonts/icons/highlighting; duplicate
HTML IDs; `onclick`-only fake links; author credit hard-coded in sidebar.
