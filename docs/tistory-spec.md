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

## Verified on the test blog

Behaviour confirmed by inspecting the rendered DOM on a live blog, not from the
official guide. The skin depends on all of it; until now it was recorded only in
comments beside the code that works around it.

- **Tistory stamps the page type on `<body>` as an id**: `tt-body-index`,
  `tt-body-category`, `tt-body-search`, `tt-body-tag`, `tt-body-archive`,
  `tt-body-page`, `tt-body-guestbook`. The skin branches on these.
- **Tistory's own stylesheets load *after* the skin's.** This is why the rules
  for the post body and the article toolbar are pitched above them, in places
  behind an id. Any rule of ours at class level inside the post body may lose.
- **Enabling covers suppresses `<s_list>` entirely** on the home page. Anything
  the home page needs — its heading included — has to live inside
  `<s_cover_group>`, not inside `<s_list>`.
- **`<s_cover>` items come from one of two sources**, chosen per cover in the
  blog's settings: entries typed by hand, or recent posts filtered by category
  and count. There is no source for comments, and none for images alone.
- **A hand-typed cover item has no date and no category** — only title, summary,
  url and an optional image.
- **The share and manage flyouts (`.layer_post`) carry no border.** What looks
  like one is `box-shadow:0 0 0 1px rgba(0,0,0,.1)`, a fixed black alpha, so
  setting `border-color` does nothing and a dark page swallows the ring.
- **Tistory replaces the `<form>` inside `<s_rp_input_form>` and
  `<s_guest_input_form>`** with its own, discarding any class on it. Styling
  hooks must go on an inner element.
- **Tistory rebuilds the controls inside `.container_postbtn`** when a reader
  likes or subscribes, so any node held from that subtree becomes detached.
- **Tistory injects `highlight.js` with a light theme from a CDN.** Two of its
  colours measure 4.01 and 4.54 against the skin's code ground.
- **`[##_tag_label_rep_##]` joins its anchors with a literal `", "`.**
- **Tistory renders declared sidebar sections and list blocks even when empty**,
  and injects an unlabelled `new_ico` image inside list-row titles.
- **A list row prints a clock time rather than a date for a post published
  today.**

## Known limitations we have chosen to keep

- **The pager renders outside `<main>`.** `<s_paging>` sits between the list
  block and the guestbook block, so it is a sibling of both landmarks rather
  than a child of either. Moving it inside the list block would put it in the
  right landmark on list pages and remove it from the guestbook, which is also
  paginated. Whether Tistory honours more than one `<s_paging>` is unverified,
  and guessing risks a skin the editor rejects outright. On the guestbook the
  visual order is corrected in CSS; the reading order is not.

## Known open questions

- Whether the `_rep_` token families rescope inside a nested reply block
  (`<s_rp2_rep>`, `<s_guest_reply_rep>`). The skin reuses the parent family
  there; if they do not rescope, a thread with a reply emits duplicate ids.
  **Unverified** — the gate cannot see it, because it skips ids whose value is
  a token.
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
