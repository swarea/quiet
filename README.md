# Quiet

A Tistory skin for long-form reading, in Korean and English.

The reading column is 50rem. Light and dark are drawn as two separate palettes
rather than one derived from the other. The Latin typeface ships inside the
package, so Latin renders as designed without reaching a CDN; Hangul falls back
to the reader's system font when that CDN is blocked. Reading, navigation, paging
and existing comments work with JavaScript disabled. Search, posting a comment
and replying to one are driven by Tistory's own scripts and do not.

Built from scratch by [swarea](https://github.com/swarea), and not a derivative
of any existing skin. It is a third-party skin *for* Tistory: it is not
published, reviewed or endorsed by Tistory or Kakao. "Tistory" and "Kakao" are
used only to identify the platform this skin is built for, and are the trademarks
of their respective owners.

> **0.4.0.** Every page type verified on a live Tistory blog in both themes, in
> Chrome and Safari. The home page's covers are verified in the preview but not
> yet on a live blog. See [CHANGELOG.md](CHANGELOG.md) for what changed and
> [Known limitations](#known-limitations) for what the skin cannot do.

## Features

- Light and dark themes, each designed separately. The visitor's system setting
  applies until they choose, after which their choice is remembered.
- A contents rail beside articles, a collapsible category tree, copy buttons on
  code blocks, and click-to-zoom on images.
- Tistory's injected markup — the comment box, the post toolbar, the share and
  manage panels — restyled to match the rest of the page.
- Colours written into a post are preserved wherever they still read. Where they
  do not, they are reconciled with the theme — see
  [What the skin changes in your posts](#what-the-skin-changes-in-your-posts).
- The Latin typeface is bundled (51 KB). Hangul uses the reader's system font.

## Install

1. Download the release archive, or run `npm run build` and take `dist/`.
2. In your blog, open the skin editor and choose HTML/CSS edit.
3. Upload every file listed below, including those under `images/`.

A missing file under `images/` is the usual cause of a skin that never finishes
loading.

| File | Contents |
| --- | --- |
| `skin.html` | the template, with Tistory's substitution tokens |
| `style.css` | compiled stylesheet |
| `index.xml` | skin metadata, cover types, and settings |
| `images/app.js` | the script bundle |
| `images/quiet-latin.woff2` | the bundled Latin typeface |
| `images/OFL.txt` | the typeface licence |
| `preview.gif`, `preview*.jpg` | thumbnails shown in the skin list |

> **Updating resets your skin settings.** Tistory clears them whenever
> `index.xml` changes, which every release does. Note your accent colours and
> home copy before uploading. Posts, comments and categories are not affected.

### Blog settings this skin expects

| Setting | Value | Why |
| --- | --- | --- |
| Menu bar | hide | 꾸미기 → 설정. Everything in it belongs to Tistory — three links to Tistory, and a subscribe button this skin already builds in the author block. It is fixed to the corner of every page and uses fixed colours that do not follow the skin's themes |
| Subscribe button | hide | the same page. This is Tistory's floating one; the skin's own sits in the author block and is unaffected |
| Mobile web | off | the skin is responsive and handles narrow screens itself |
| Covers | at least one | without any, Tistory serves the plain post list and the home page matches the category archive |

Four cover types are available:

| Cover | Purpose |
| --- | --- |
| Introduction | the opening band. The cover's own title becomes the small line above it; a single hand-entered item supplies the headline, the line below, and an image if you attach one. Pointed at a post list instead, it keeps the treatment for the first item and steps the rest down |
| List | posts in one column |
| Featured | one post with its image beside it |
| Topics | posts in a grid, three across. Not grouped: Tistory repeats a cover item and offers no way to divide them |

### Settings

| Setting | Variable | Default | Effect |
| --- | --- | --- | --- |
| Blog language | `lang` | Korean | the language this blog is mostly written in, applied before scripts run. Individual pages then detect their own |
| Home: small line | `home-eyebrow` | empty | a short line above the home headline. Requires a headline |
| Home: headline | `home-headline` | empty | the home page's opening line. Not used when covers are set, because a cover then supplies the top of the page |
| Home: supporting line | `home-tagline` | empty | a line below the headline. Requires a headline |
| Accent colour (light) | `accent-light` | `#38548c` | links and emphasis on light backgrounds |
| Accent colour (dark) | `accent-dark` | `#90a8e0` | the same for dark backgrounds |
| Default theme | `theme` | follow visitor | the theme a first-time visitor sees |
| Sidebar | `sidebar` | on | the navigation column on wide screens |
| Contents rail | `toc` | on | the contents rail, and its panel on narrow screens |
| Reading progress | `reading-progress` | on | the line at the top of the window |
| Related posts | `related-posts` | on | other posts from the same category, below an article |
| Previous and next post | `prev-next` | off | links to adjacent posts. Off by default because it duplicates the related list on blogs with small categories |

Settings left empty are hidden rather than rendered blank.

## What the skin changes in your posts

Your posts are never edited. What follows happens in the browser, at display
time only, and only inside the article body.

The Tistory editor writes colour onto the element, so text pasted from another
page arrives carrying that page's palette as inline style — which outranks any
stylesheet and therefore follows no theme. On a dark page that shows up as white
slabs behind paragraphs, callout boxes that stayed white, and code blocks wearing
a light syntax theme inside the dark frame.

So, per element:

| what it carries | what happens |
| --- | --- |
| a colour that still reads where it landed | nothing — it is your choice and it is kept |
| a background on something you built a box around (padding, a border, a radius) | moved into the current theme, keeping its hue |
| a background that is only the paper of the page it was copied from | dropped, so the page's own ground shows through |
| a `<pre>` that arrived already painted | replaced by the skin's code frame |
| text that fails 4.5:1 against what it now sits on | falls back to the theme's own text colour |

Two consequences worth knowing:

- **Text that was invisible becomes visible.** White text on a white background
  is hidden by accident, not by design, so it is given a readable colour rather
  than left hidden.
- **A deliberate colour inside a pasted code block is flattened.** Only blocks
  that arrived with an inline style are treated this way; a code block you
  coloured by hand is untouched. highlight.js colours by class rather than by
  inline style, so this pass does not reach it; the skin sets those classes
  itself elsewhere.

With JavaScript off, only the code-frame rule applies; everything else is left
exactly as written.

## Known limitations

- **The home page requires covers.** Without them Tistory serves the plain post
  list, which a skin cannot override.
- **Search and posting a comment require JavaScript.** Tistory implements both.
- **`<title>` keeps Tistory's wording.** Headings are translated where the
  phrase is Tistory's own, but the document title is what search engines index.
- **Replying to a comment opens a Tistory window.** The reply control calls
  Tistory's own function, which opens a page this skin does not style.

## Customising beyond the settings

Theme colours come from two palettes declared at the top of `style.css` as
`--light-*` and `--dark-*`. Overriding one in the skin editor recolours
everything that uses it:

```css
:root{ --light-surface-2:#f6f4ef; --dark-surface-2:#232830; }
```

The code block has its own pair, `--light-code-*` and `--dark-code-*`, covering
the block, the bar above it and every syntax colour. Two groups sit outside the
palettes deliberately: the image lightbox, which is always dark, and the print
stylesheet.

Text placed on the accent colour is chosen by measurement — the skin compares
the accent against black and white and uses whichever gives higher contrast.

## Compiler targets

Compiled for Chrome, Edge and Firefox 100+, Safari and iOS 15+, and Samsung
Internet 16+. These are what the stylesheet and script are compiled for, not
browsers the skin has been tested in: it has been checked by hand on a live blog
in Chrome and Safari only.

The validation gate checks two compiler behaviours: that no modern media-range
syntax is emitted, and that every `color-mix` has a fallback. Features newer
than the targets are guarded in the stylesheet itself — `:has()` behind
`@supports` — not by the gate.

## Develop

```bash
npm install
npm run preview   # build and serve the mock preview at http://localhost:4321
npm run build     # build the mock preview and the installable package
npm run check     # validation gate
npm run release   # gate, build, and a versioned archive in release/
```

`npm run build` writes the installable package to `dist/`.

`npm run release` refuses a dirty working tree or a package missing a required
file, and writes an archive with its SHA-256. On the same Node version and
lockfile, identical inputs produce identical bytes.

The mock preview is a local stand-in for Tistory and uses its own markup, so it
is useful for layout work but does not verify the skin itself.

Skin thumbnails are generated by opening `scripts/make-previews.html` in a
browser; place the resulting files in `src/assets/`.

## Documents

| Document | Contents |
| --- | --- |
| [docs/product.md](docs/product.md) | what the skin is for, and the rules the design follows |
| [docs/tistory-spec.md](docs/tistory-spec.md) | Tistory platform behaviour: what has been verified, and what is still open |
| [docs/roadmap.md](docs/roadmap.md) | release milestones |
| [docs/decisions/](docs/decisions/) | architecture decision records |
| [CHANGELOG.md](CHANGELOG.md) | what changed, by release |
| [CONTRIBUTING.md](CONTRIBUTING.md) | workflow rules |
| [SECURITY.md](SECURITY.md) | scope, and how to report a vulnerability |
| [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) | the typeface and the build tools |

## Built with

Plain CSS with custom properties and vanilla TypeScript, compiled by Lightning
CSS and esbuild. Nunjucks builds the mock preview only. Rationale in
[ADR-0001](docs/decisions/ADR-0001-build-architecture.md).

## License

[MIT](LICENSE) for the skin. The bundled Latin typeface is a subset of
Pretendard under the SIL Open Font License 1.1, renamed as that licence
requires. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
