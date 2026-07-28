# Changelog

Starts at 0.2.1. Earlier releases are described in their GitHub release notes.

## 0.3.0

Upgrading resets a blog's saved skin settings, as every change to `index.xml`
does. Note your accent colours and home copy before uploading.

### Added

- The Latin typeface is bundled as `images/quiet-latin.woff2` (51 KB), cut from
  Pretendard at build time and renamed as the licence requires. Hangul uses the
  reader's system font. See
  [ADR-0003](docs/decisions/ADR-0003-bundled-latin.md).
- An Introduction cover type for the home page's opening band. The three
  home settings meant to produce it could not: they lived in the list block,
  which Tistory does not render once covers are enabled.
- Language detection. A post is marked from its own text; a page of titles can
  correct the blog-level declaration. A `lang` setting supplies the answer
  before scripts run and where they do not run at all.
- `SECURITY.md`, `CHANGELOG.md`, and a workflow that runs the validation gate on
  every pull request and push.

### Changed

- The featured cover renders one post with its image beside it, replacing a
  two-column card layout.
- Titles in the reading column carry full contrast and do not respond to hover.
  Navigation rests one step lighter and darkens under the pointer.
- Sidebar rows are spaced consistently; a category with sub-categories no longer
  adds 4px below itself.
- The subscribe button is 28px rather than 33px, below the button that submits a
  comment.
- The validation gate runs after the build during a release, so the checks that
  read `dist/` are no longer skipped. A tag that disagrees with the manifest
  version is refused.

### Fixed

**Structure**

- The home page rendered no `<h1>` when covers were enabled.
- A post, a page and a notice rendered no `<main>` landmark; the guestbook
  rendered two, one of them empty.
- Cover section headings and the item titles beneath them were both `<h2>`.
- The contents heading was an `<h4>` following the article's `<h2>` elements.

**Without JavaScript**

- With the sidebar disabled, the layout kept an empty 288px column and rendered
  no footer.
- The theme toggle and back-to-top buttons were visible but inert.
- Revealed blocks were hidden before the observer that reveals them was
  constructed, so they stayed hidden if it was unavailable.
- The readiness marker was set before the modules ran, so a failure in either
  module that reveals what CSS hides left the category tree and the sidebar
  unopenable.

**Correctness**

- The skin description claimed search and comments work without JavaScript.
- The copy button reported success on a rejected write and where no clipboard
  was available.
- A repeated confirmation prompt could be answered from a stale record.
- The editor's image alignment had no effect: class-level rules were outranked
  by an id-scoped rule of the skin's own.
- The subscribe button was styled by a leftover definition that overrode the
  one the skin builds.
- The subscribe proxy held a reference to a node Tistory replaces.
- Three Korean strings Tistory writes into the comment list were untranslated.

**Accessibility**

- The image lightbox declared `aria-modal` without trapping focus or making the
  background inert, and images could only be opened with a pointer.
- Heading anchors were focusable while marked `aria-hidden`.
- The rail's avatar was a link with no accessible name, duplicating the link
  beside it.
- Comment actions and the section link measured 21px and 22px against a 24px
  minimum on touch.
- English interface text was unmarked inside a document declared Korean.
- The toolbar's focus ring was removed unconditionally but restored only via
  `:focus-visible`, which Safari 15.0–15.3 does not support.

### Removed

- Rulesets for markup the skin no longer emits: `.quiet-prevnext`,
  `.quiet-proto-note`, and two rules for a superseded featured block.
- The `:target` background on a comment reached by its anchor.

## 0.2.0

The first installable package. See the release notes for `v0.2.0`.
