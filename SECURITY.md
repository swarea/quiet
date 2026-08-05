# Security

## What this project is, in security terms

Quiet is a Tistory skin: an HTML template, a stylesheet, a small script bundle
and a font, uploaded to a blog and served by Tistory. It has no server, no
database, no accounts, and no network access at build time or at run time: every
file a page needs is in the package Tistory serves. It stores two values about a
reader, both in `localStorage` and neither leaving the browser: `quiet-theme`,
which of the two themes they chose, and `quiet-cat-open`, which category folds
they left open in the sidebar.

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
post. Heading text is escaped before it is interpolated. Heading ids are
derived — slugified down to word characters and Hangul, so nothing that could
close an attribute survives — **except where the heading already carries one**.
An id written into the post by hand is used as it stands, and reaches the
contents list inside an `href` without being escaped. On a single-author blog
that is the author writing markup into their own page, which is why it has not
been changed; it is the one place here where post content is trusted, and it is
worth knowing before that stops being true.

`src/scripts/modules/relabel.ts` rewrites text Tistory generates — button
labels, a category name, a comment marked private. Most of its table is applied
by substring rather than by exact match, so a phrase it does not know can be cut
into; that is a correctness risk and it is bounded to Tistory's own blocks, which
the module names. Every write goes to a text node's value, to `textContent`, or
to an `aria-label` or `title` attribute. None of them parses markup.

`lang.ts` only reads: it counts Hangul against Latin to decide what a page is
written in, and sets a `lang` attribute. It writes no text.

Both operate on content the blog's own author or Tistory produced. On a
single-author blog neither crosses a privilege boundary, but they are the places
to look first.

Three other places build markup with `innerHTML` — the contents list, the
lightbox, and the empty-list notice. The lightbox interpolates nothing; the
notice interpolates only strings this project wrote, escaped anyway; the
contents list escapes every heading it takes from a post.

## Dependencies

Four development dependencies — esbuild, Lightning CSS, Nunjucks and
subset-font — and none of them ships in the package. `package-lock.json` is
committed, so an install resolves to the same versions that were tested.
