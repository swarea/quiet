# Security

## What this project is, in security terms

Quiet is a Tistory skin: an HTML template, a stylesheet, a small script bundle
and a font, uploaded to a blog and served by Tistory. It has no server, no
database, no accounts and no build-time network access. At runtime one
third-party host is contacted — jsDelivr, for the Hangul half of the typeface —
and the skin works with it blocked. It stores nothing about
a reader except one value in `localStorage` — which of the two themes they chose.

Almost everything on a page carrying this skin is Tistory's: the comment system,
the search, the login, the post toolbar, the analytics. **A vulnerability in any
of those is Tistory's to fix, not this project's.** Report those through
Tistory's own channels.

What is in scope here is the template, the stylesheet, the script bundle, and
the build that produces them.

## Reporting

Open a [private security advisory](https://github.com/swarea/quiet/security/advisories/new).
Please do not open a public issue for something exploitable.

Replies are usually sent within a week, but this is a solo project and no
response time is guaranteed. A fix may take longer than the reply; you will be
told either way.

## Scope

In scope:

- The skin template (`src/skin.html`) and anything it renders from Tistory's
  substitution tokens.
- The script bundle (`src/scripts/`), including how it reads and writes the DOM
  Tistory generates.
- The build (`scripts/`), including the dependencies it pulls at install time.
- The published release archive.

Out of scope:

- Tistory itself, and anything it injects into the page.
- A blog's own content. A post can contain whatever its author writes; the skin
  styles it and does not sanitise it.
- Social engineering, and anything requiring access to a blogger's account.

## What the skin does with untrusted input

Two places take text the skin did not write and put it back into the page.

`src/scripts/modules/toc.ts` builds the contents list from the headings in a
post. Heading text is escaped before it is interpolated, and heading ids are
derived rather than copied.

`src/scripts/modules/relabel.ts` and `lang.ts` rewrite text Tistory generates —
button labels, a category name, a comment marked private. They match exactly and
write through `textContent` rather than `innerHTML`, so these paths are not
intended to be able to introduce markup.

Both operate on content the blog's own author or Tistory produced. On a
single-author blog neither crosses a privilege boundary, but they are the places
to look first.

## Dependencies

Four development dependencies — esbuild, Lightning CSS, Nunjucks and
subset-font — and none of them ships in the package. `package-lock.json` is
committed, so an install resolves to the same versions that were tested.
