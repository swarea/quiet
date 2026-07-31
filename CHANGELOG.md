# Changelog

Kept from 0.2.0, the first release with an installable package. The work before
it built the repository, the pipeline and the design, and produced nothing to
install, so there is no 0.1.0 and nothing earlier to record.

## Unreleased

### Changed

- The typeface carries Hangul as well, and nothing is fetched from another host.
  The skin had been paying both costs at once: the obligations of redistributing
  a font, and a jsDelivr request on every page load that the design still leaned
  on. Latin-only rested on a mostly-mobile audience, which was assumed rather
  than measured -- on the live blog **91.4% of readers are on a desktop**, which
  in Korea means Malgun Gothic for nearly all of the text. Cut at build time the
  file is 596 KB rather than the 821 KB recorded, and the package goes from
  338 KB to 900 KB. See [ADR-0004](docs/decisions/ADR-0004-bundled-hangul.md).
- Bold is bold again. The font was cut with `subset-font`'s `variationAxes`
  option, which instances a variable font rather than narrowing its axis, so the
  file was pinned at 400 while the stylesheet declared `font-weight: 300 800` —
  the browser believed the declaration, declined even to synthesise a bold, and
  every weight on the page rendered at 400. Measured before the fix, a headline
  asking for 700 carried exactly the ink of one asking for 300. It had been true
  since the typeface was first bundled, and went unseen because Hangul came from
  the CDN where the axis worked. The typeface now ships as two files split by
  `unicode-range`: Latin with a live axis at 53 KB, Hangul as one static instance
  at 568 KB. A page with no Korean on it loads only the first.
- The family is **Quiet Sans**, not Quiet Latin. A file holding 11,172 Hangul
  syllables is not a Latin subset and should not be named as one. The rename the
  OFL requires is satisfied either way.

- The grid cover is called **Grid**. It was called Topics, which promises the
  posts under it are grouped by one — and the description had already stopped
  promising that, because Tistory repeats a cover item and offers no way to
  divide them. The label was the last place the old promise survived. Its
  classes followed: a `lane` was a column of a category and is a post now.
- The default-theme option reads "Match the visitor's system" rather than
  "Follow visitor", which never said what was being followed.
- The skin variable is `default-theme`. It was `theme`, and six lines from where
  it is read the same word names a different thing: `data-theme` on the root is
  the theme in force, while the variable is only the preset a blog starts from.

- The description a stranger reads in the skin editor says what the skin is for
  rather than what it is proud of. It had been three facts about how the thing
  was built -- light and dark drawn separately, a bundled typeface, no
  JavaScript needed -- and the panel cut the last of them off mid-sentence at
  141 characters. The gate's ceiling was 160, a number chosen before anyone had
  seen the panel; it is 125 now, which is measured: 121 characters wrapped to
  two lines and showed in full, 141 wrapped to the same two lines and was cut at
  about 128.
- The Home settings say that a cover, once set, supplies the top of the page and
  the home headline is not used. Three variables and a cover competed for the
  same place and only the code said which one won.

## 0.4.0

Upgrading resets a blog's saved skin settings, as every change to `index.xml`
does. Note your accent colours and home copy before uploading.

### Changed

- Changing theme moves the whole page at once. `body` alone carried a
  three-tenths-of-a-second fade while everything drawn on it cut across
  immediately, so the largest bright surface drained away underneath panels that
  had already gone dark. Where a browser can cross-fade a document it now does;
  where it cannot, and where less motion has been asked for, the change is
  instant.
- The code block follows the theme. It had one dark set of colours used in both,
  which left a black slab as the heaviest thing on a light page. There are now
  `--light-code-*` and `--dark-code-*` palettes covering the block, the bar above
  it and all ten syntax colours, and the gate holds every one of them to 4.5:1 in
  both themes. The bar was a pair of white alphas that only meant anything on a
  dark block; it is tokens now like everything else.

### Fixed

- Colour pasted into a post is reconciled with the theme it is read in. The
  editor keeps colour on the element, so text copied from another page arrives
  carrying that page's palette, and inline style outranks the stylesheet. Three
  things followed from that, and all three are the same fault:
  - A callout the author built kept the white it was given, on a dark page.
    Words inside it that carried a colour survived; words that carried none
    inherited the theme's light ink and disappeared.
  - Code copied from a page using `atom-one-light` brought that theme's ground
    with it, so a pale block landed inside the dark code frame, under syntax
    colours drawn for a dark one.
  - Paragraphs, headings and spans arrived carrying the white of the page they
    were copied from — over a thousand of them on the author's blog — and became
    white slabs in dark mode.

  The ground is now settled before the text is measured against it. A background
  the author built a box around moves into the theme; one that is only the
  source page's paper is dropped. Anything that still reads where it landed is
  left exactly as it was, which in light mode is all of it.
- Sidebar lists no longer break mid-column. Tistory truncated them by character
  count on the server while the stylesheet clamped them by line, and the two
  disagreed; the server limits are now past what two lines can hold, so the
  ellipsis lands where the line actually ends.
- The visitor counts sit in a band of their own rather than reading as a heading
  for the category tree below them.
- Tistory's link card, built from a pasted URL, had never been styled and kept
  the fixed colours Tistory gives it. Measured against a dark page its frame
  came to 13.28 and its title to 1.12, so the title was not there at all; on a
  light page its description measured 3.08, under the floor this project holds
  itself to. 99 of them appear across the author's posts.
- The pagination never marked the page being read: the class it styled was one
  the skin invented, where Tistory writes `selected` on a span inside the link.
  Numbers were also boxed twice over, and the ellipsis between ranges responded
  as though it led somewhere.
- Hover no longer paints a surface that was not already there — pagination, the
  copy button, the subscribe pill, the post toolbar, the share menu. Table rows
  lose the highlight entirely: a row is read, not aimed at.
- The share menu's rows went back to painting Tistory's near-white on hover. The
  rule removed while making hover paint nothing had been replacing that fill
  rather than creating it, so removing it made a dark panel worse; the fill is
  switched off now instead of left unset.
- The tooltip on the post toolbar read `Report하기`. Relabelling replaces by
  substring, and the table's shortest Korean entry was cutting the front off a
  longer word Tistory writes. The table is sorted by length before use — it
  claimed to be and was not — and the compound is listed.
- Quotes, captions and the "더보기" toggle kept the fixed colours Tistory gives
  them. A quote in the `style1` variant measured 1.48 on a dark page, which is a
  quote nobody can read; the skin had coloured `blockquote` at class level and
  Tistory declares it again behind `#tt-body-page`, while the paragraphs inside a
  quote had no colour of their own at all.
- The light code block read yellow. Its grounds carried about 1.7× the warmth the
  rest of the light palette keeps, which is enough to be seen as a colour rather
  than a cast; they now follow the same measure the page's own grounds do.
- Eleven highlight.js classes kept the colours of the theme Tistory loads from a
  CDN, which was chosen for a page this skin did not design. One of them,
  `hljs-selector-class`, measured 4.22 in light and 3.78 in dark. The gate now
  requires every class that theme colours to be one the skin sets, because the
  contrast check can only see colours that are in the token sheet.
- The release notes no longer break mid-sentence.
- Every home cover sits on one left edge. `.quiet-wrap` gives a section the 2rem
  inset that keeps the page aligned, and three covers reset it with a
  `padding: <n> 0` shorthand; the featured cover, which had no padding rule at
  all, was the only one that kept it, leaving the other three 32px to its left.
  The gate now refuses the `padding` shorthand on any class that shares an
  element with `.quiet-wrap`.
- Vertical rhythm follows a cover's position rather than its type. Covers are
  reordered and removed in the blog's settings, so a bottom margin that belonged
  to the grid was only ever right while the grid was last, and the featured
  cover, which carried no vertical padding at all, was only ever right in the
  middle. The last cover now leaves room under itself whichever one it is.
- A list row's contents line up with the heading above them. The row kept the
  side padding that once held a hover fill off the text, so its date and
  thumbnail sat 14.4px inside a divider drawn at the row's own edges.
- An image attached to an Introduction item is shown beside the words instead of
  being discarded. The cover had nowhere to put one, so a blogger who attached
  an image simply never saw it.
- The Introduction cover survives being pointed at a post list. Tistory repeats
  the block, and five post titles arrived at display size — 1,558px of band. The
  first item keeps the treatment the cover exists for and the rest step down.
  Nothing is hidden.
- The Topics grid is a grid of posts. It gave each item a category heading with
  a rule under it, as though the items below were a group; Tistory repeats a
  cover item and offers no way to group them, so five posts in one category
  printed five headings reading "Backend".
- A post's category names the branch it hangs off. Tistory documents one thing
  under two tokens and sends two: a cover returns `Backend` where a list returns
  `Engineering/Backend`, so the same category was written two ways on two pages.
  No token anywhere returns a parent or a path, and the hierarchy survives only
  in the category url, so the trail is assembled from there — in the list's own
  spelling, slash included. Without scripting the leaf still shows.
- Changing theme no longer leaves half the page in the old one. Any property fed
  by a theme token and given a transition of its own was orphaned at the previous
  theme's value and stayed there: 41 elements across 13 kinds after one toggle,
  the category tree among them at 1.70 against its new ground. Element
  transitions are held for the swap and released a frame after the colours land.

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
