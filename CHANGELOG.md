# Changelog

Kept from 0.2.0, the first release with an installable package. The work before
it built the repository, the pipeline and the design, and produced nothing to
install, so there is no 0.1.0 and nothing earlier to record.

## Unreleased

### Fixed

- The rule under the shortcut dialog's title follows the theme. It is a fixed
  `#eee`, which is a hairline on a white panel and the brightest thing in the box
  on a dark one: measured 1.16 against the dialog's ground in light and **15.02**
  in dark. It survived the previous fix because that one moved the ground and the
  words and this line is neither. The orange rule under each section heading is
  left alone — that one is Tistory's own mark, and it reads at 3.32 and 5.24.

- The ring that says which comment box you are typing in is visible. Blended at
  45% of the accent it measured **2.34** against the page in light and 3.10 in
  dark — under the 3:1 a focus indicator has to clear, and under it on the theme
  most readers use. At 75% it measures 4.18 and 5.33. The blend is kept rather
  than swapped for the accent outright, because the box is large and a full
  accent edge around it shouts.
- Two controls are big enough to hit. Measured on a 390px screen: the
  secret-comment toggle came to 64x21 around a 13px box with the next control
  14px away, and a section's *More* link to 44x22 with a neighbour 18px away —
  both under the 24px a target needs and both too crowded to be excused by the
  spacing allowance instead. They are 24px now. The category crumb above an
  article is 148x14 and is left alone: nothing else is within 104px of it, which
  is what the spacing allowance is for.
- Tistory's hover tooltip has an edge on a dark page. Its fill is a fixed
  translucent black, which separates from a light page at 19.67 and from a dark
  one at 1.09 — the chip and the page the same colour, with only the white text
  saying a chip is there. Light is left alone, where there is nothing to fix.

## 0.5.0

Upgrading resets a blog's saved skin settings, as every change to `index.xml`
does — and this release renames three of them, so the reset is certain rather
than incidental. Note your accent colours and home copy before uploading.
**Contents rail** is now **Table of contents**, and the three home lines are
named by where they sit rather than by how they look.

Two files to upload rather than one, unchanged from 0.4.0: the typeface ships as
`images/quiet-sans-latin.woff2` and `images/quiet-sans-hangul.woff2`.


### Changed

- Every field is called one thing. A text box here is labelled twice — a hidden
  `<label>` that is all a screen reader reads, and a placeholder that is all a
  sighted reader sees — and the two had drifted apart. The comment box announced
  "Write a comment" and displayed "Leave a comment"; the guestbook announced an
  "entry" and asked for a "message". Someone driving the page by voice says the
  words in front of them, which were never the words the field answered to. The
  visible wording wins in both. A gate check now compares the pair on every
  labelled field, in the skin and in the mock, so they cannot part again.
- The table of contents has one name per audience instead of three. The setting
  was **Contents rail**, the landmark a screen reader announced was **Contents**,
  and the title on the page was **On this page**. The setting is now **Table of
  contents**, which is the term a blogger looks for and the one the variable and
  the module were already named after; the landmark takes the title's words, so
  what is heard and what is read agree. The reader-facing title is unchanged.
- The sidebar's notices section is **Notices** in both places. Its heading said
  "Notice" while its landmark said "Notices" — the only pair among the sidebar's
  six that disagreed on a word rather than expanding it.
- The three home lines are named by where they sit: **Home: line above the
  headline**, **Home: headline**, **Home: line below the headline**. The first
  had been "Home: small line", describing a size where its siblings described a
  role, so the set read as three unrelated settings.
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

### Fixed

- A dark page no longer flashes the white paper a paste carried in. The module
  that clears those grounds cannot run before the page is painted — the theme is
  settled by a blocking script in `<head>`, while the module rides a deferred
  bundle that waits for the whole document, and on a long post the browser paints
  in between. The stylesheet now draws no author colour at all on a dark page
  until the module has judged it, and puts back whatever survives. Light mode
  is untouched: there the carried white matches the page and was never visible,
  so suppressing it would have invented a flash instead of removing one.
- The words the paste carried in are held too, not just the paper under them.
  Holding only the ground made this worse before it made it better: the white
  had been hiding the black, so taking it away a frame early left the author's
  copied-in text alone on a dark page, where it is not dark text, it is no text.
  Measured at first paint on a live post, 118 of 129 elements carrying an inline
  colour were unreadable; now none are. What it costs is the few colours the
  author meant, which show as theme ink for that frame — 4 elements against 118
  on the post measured.
- The reading column is the same width on every page. Whether the window drew a
  scrollbar depended on whether the page happened to be taller than it, and the
  column was measured from what was left: on this blog the home and a category
  came to 982px and an empty search and the guestbook to 992px, so every move
  between them re-wrapped the text and shifted the page 10px sideways. The gutter
  is reserved now, as the sidebar already reserved its own. Measured across four
  page types after: 982 on all of them.

- The page no longer grows under the reader as the bundle lands. A code block is
  a bare `<pre>` until the bundle wraps it in a frame with a header above it, and
  a table is bare until it is wrapped for scrolling — so every one of them got
  taller the moment the bundle ran, and everything below moved down. Measured on
  a live post with eight code blocks: **the page grew 525px**, in steps of 61 at
  each paragraph following a block.

  The room is held now, and held by drawing the bar rather than by leaving a gap
  — same height, same ground, same edge — so what arrives is the same band with
  words in it. The rest of each 61px was the frame and the block disagreeing about
  their own edges: `1.8em` resolved against the article's size on the wrapper and
  against the smaller code size on the `<pre>`, plus a border one had and the
  other did not. Both take `--block-gap` now, the bar's height is stated once in
  `--code-bar-h` and read by both the bar and the room held for it, and a bare
  table's spacing is pitched where Tistory's own 20px cannot reach it. Measured
  after: **0px** for both, against 46px with no reservation.

- Tistory's own components are themed even where this skin normally hides them,
  because hiding them is a thing the bundle does and the fallback is a promise.
  The subscribe button in the article's tool row is taken out of the layout only
  once the replacement beside the author exists — so on the path where the bundle
  never arrives, what the reader gets is Tistory's, with a fixed
  `rgba(185,185,185,.5)` around it measuring **9.56** on a dark page. It now
  measures 1.30, the same as the like control beside it.

  The keyboard-shortcut dialog is the same fault, further along: it owns its
  ground and inherits its ink, so a fixed `#ffffff` sat under this skin's light
  grey at **1.21** — text present, sized, laid out and unreadable. It opens on a
  keypress on every page, and does not fire on a custom domain, which is why it
  went unseen here while every blog still on a `tistory.com` address can open it.
  Measured after: 14.35 in dark, and the line under the table from 2.35 to 6.84
  in light, where it had been under the floor too.

- The outline around an attached file is the skin's, not Tistory's. Our rule for
  that block reached its background and its padding but not its edge or its
  corner: Tistory declares those two a second time behind `#tt-body-page`, which
  a post carries, so what was left was a fixed `rgb(233,233,233)` — the same
  near-white in both themes. Measured on a live post it sits at 1.17 against a
  light page, which is why it went unnoticed, and at **15.44** against a dark
  one, about fourteen times louder than every other border in the skin. It now
  measures 1.30 there, the same as a code frame. The corner came from the same
  rule and had been arriving at 1px.

- A link card is drawn one way, and a link with no share image uses the whole
  card. Tistory reserves 200px for the thumbnail whether or not there is one and
  fills it with nothing, leaving an empty block down the side and the text
  crowded into what is left; the card says so itself, writing `url()` with
  nothing in it, which a selector can read. And a card that was pasted rather
  than typed carries Tistory's own #909090 inline on its description and host,
  which outranks any selector — so on one post 4 of 11 cards were drawn in a
  different grey from the other 7, down a single article.

- The last two Korean strings on an English page are translated: the "opens in a
  new window" hint on Tistory's share links and the name of its floating toolbar.
  Neither is visible — both are names only a screen reader hears — and they were
  found by walking Tistory's own blocks for Hangul once everything on screen had
  already been translated.

- Tistory's Korean is corrected in a background tab too. The article toolbar —
  like, share, subscribe — is relabelled once at boot and again whenever Tistory
  rewrites it, and that second pass waited for an animation frame. A hidden tab
  never has one, so a post opened in a background tab kept 구독하기 and 공감 until
  the reader looked at it. Measured on a live post with the tab hidden: no frame
  had run at all, long after boot. It is a timer now. A frame is the right unit
  for something being drawn; this is a correction, and a correction cannot wait
  to be looked at. A gate check now refuses a frame inside a MutationObserver,
  which is the shape this bug takes.

- The complete listing is called *All posts* from the first frame, in the page's
  heading and in the sidebar's row to it. Tistory names that one page itself —
  *Categories*, over a list that is not categories at all — and no token or
  setting reaches the word, so the bundle rewrote it; being deferred, it arrived
  after the page was painted and the reader watched the word change. Both now
  render right to begin with: the heading carries both names and the stylesheet
  picks one, and the sidebar's row is drawn beside Tistory's own, which is
  silenced only until the bundle has rewritten it for real.

  Found by diffing the HTML Tistory serves against the DOM once the bundle has
  run, across the home page, the complete listing and an article, rather than by
  looking for them one at a time. Extended to computed style as well as text —
  colour, weight, spacing, borders, 21 properties over 715 paired elements —
  which found nothing else changing on an article at all.

  A cover's category still changes, from *Data* to *Engineering/Data*. It is
  assembled from the category's url and no stylesheet can do that, and a word
  changing is a smaller cost than a gap waiting to be filled. The same reasoning
  leaves a list row's time alone: Tistory prints a clock rather than a date for a
  post published today, and which rows those are is not knowable before the
  bundle runs.
- A pasted code block keeps its own frame through all of this. `<pre>` was
  already answered in the stylesheet, from first paint and with scripts off, and
  the hold introduced above outranked that answer — so a pasted block lost its
  ground for exactly the frame the hold exists to protect. It is now excluded.

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
