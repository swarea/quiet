# Changelog

Two documents referred to this file before it existed. It starts here rather
than being reconstructed: entries below 0.2.1 would be written from the git log
after the fact, and a changelog assembled that way says less than the log it
came from.

Dates are the date of the release, not of the work.

## Unreleased — 0.2.1

Everything in this entry came out of a full audit of the skin against a live
blog. Grouped by what a reader of the blog would notice.

### The page was wrong

- The home page carried no `<h1>` at all when covers were enabled. Enabling
  covers suppresses the block the heading lived in, which nothing had noticed.
- The opening band — a headline and a line under it — could not appear on the
  home page for the same reason. It is now a cover of its own, composed beside
  everything else rather than in a settings panel.
- A post, a page and a notice rendered no `main` landmark; the guestbook
  rendered two, one of them empty.
- With the sidebar switched off and scripts unavailable, the layout kept an
  empty 288px column and rendered no footer.
- The editor's image alignment did nothing on a live post: the class-level
  rules were outranked by a rule of ours scoped to an id.
- The subscribe button was styled by a definition left over from when it lived
  somewhere else, which overrode the one the skin actually builds.

### The page lied

- The skin's own description told bloggers that search and comments work with
  scripts off. Tistory drives both.
- The copy button reported success when the write was rejected, and when there
  was no clipboard to write to.
- A repeated confirmation prompt could be answered from a stale record, so a
  delete could be confirmed that nobody was asked about twice.
- The readiness marker was set before the modules ran, so it attested that the
  bundle had parsed rather than that anything worked. A failure in either
  module that opens what the stylesheet hides left a category tree and a
  sidebar that could not be opened.

### Keyboard and screen reader

- The image lightbox called itself a modal and let Tab walk out of it into the
  page behind, and images could only be opened with a pointer.
- The contents heading was an `h4` following the article's `h2`s, and every
  heading anchor was a tab stop that screen readers were told did not exist.
- The picture in the rail was a link with nothing to announce, pointing where
  the name beside it already pointed.
- Comment actions and the section link were 21 and 22 pixels tall against a
  24 pixel minimum on touch.

### Release and validation

- The gate ran before the build, so a release never verified that Tistory's
  tokens survived into the archive it was publishing.
- A tag that disagrees with the manifest is now refused; a throwaway archive is
  now named as one.
- The gate runs on pull requests and pushes, which `CONTRIBUTING.md` had
  described since the repository was set up and nothing was doing.
- Skipped checks are reported separately instead of counted among the ones that
  ran.

### The typeface and the language

- The Latin half of Pretendard is cut at build time and ships inside the
  package, so the letters the design was drawn for no longer depend on a third
  party staying up. 51 KB, one file, renamed as the licence requires, with the
  licence beside it. Hangul is left to the reader's system font, which is what
  this typeface was drawn to sit beside. See
  [ADR-0003](docs/decisions/ADR-0003-bundled-latin.md).
- A post now says what language it is written in, judged from its own words,
  and a page of titles can correct what the blog declared. A blogger who never
  opens the setting is mostly right anyway, which matters for a skin that will
  not only be installed on Korean blogs.
- The blog's own language became a setting. It decides what the page says
  before scripts run and where they do not run at all.

### Design

- Titles in the reading column arrive at full strength and do not respond to a
  pointer; navigation rests lighter and darkens under one.
- The featured cover stands one post up with its picture beside it, rather than
  shelving two cards.
- The sidebar holds one gap from top to bottom; a category with sub-categories
  no longer pushes the next row down.

## 0.2.0

The first installable package: `skin.html`, `index.xml`, `style.css`,
`images/app.js` and the preview images, built from source and released from a
tag. See the release notes for `v0.2.0`.
