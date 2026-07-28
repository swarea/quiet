# Quiet

A Tistory skin for long-form reading, in Korean and English.

The reading column is 50rem. Light and dark are drawn as two separate palettes
rather than one derived from the other. The Latin typeface ships inside the
package, so the skin renders as designed without reaching a CDN. Everything
except search and comment posting works with JavaScript disabled.

Built from scratch by [swarea](https://github.com/swarea). Not a derivative of
any existing skin, and not affiliated with Tistory or Kakao.

> **0.3.0.** Verified on a live Tistory blog in both themes, in Chrome and
> Safari. See [CHANGELOG.md](CHANGELOG.md) for what changed and
> [Known limitations](#known-limitations) for what the skin cannot do.

## Features

- Light and dark themes, each designed separately. The visitor's system setting
  applies until they choose, after which their choice is remembered.
- A contents rail beside articles, a collapsible category tree, copy buttons on
  code blocks, and click-to-zoom on images.
- Tistory's injected markup — the comment box, the post toolbar, the share and
  manage panels — restyled to match the rest of the page.
- Author colours pasted into a post are preserved, except where a colour would
  fall below readable contrast in the theme the visitor is using.
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
| Menu bar | display | keeps the Tistory menu reachable |
| Mobile web | off | the skin is responsive and handles narrow screens itself |
| Covers | at least one | without any, Tistory serves the plain post list and the home page matches the category archive |

Four cover types are available:

| Cover | Purpose |
| --- | --- |
| 소개 | the opening band. Its cover title becomes the small line above; one hand-entered item supplies the headline and the lede |
| 리스트 | posts in a single column |
| 대표 글 | one post with its image beside it |
| 주제 묶음 | a grid grouped by category |

### Settings

| Setting | Default | Effect |
| --- | --- | --- |
| `lang` | `ko` | the blog's language, applied before scripts run. Individual pages then detect their own |
| `home-eyebrow` | empty | a short line above the home headline |
| `home-headline` | empty | the home page's opening line |
| `home-tagline` | empty | a line below the headline. Requires a headline |
| `accent-light` | `#38548c` | link and emphasis colour on light backgrounds |
| `accent-dark` | `#90a8e0` | the same for dark backgrounds |
| `theme` | follow visitor | the theme a first-time visitor sees |
| `sidebar` | on | the fixed navigation column on wide screens |
| `toc` | on | the contents rail, and its panel on narrow screens |
| `reading-progress` | on | the progress line at the top of the window |
| `related-posts` | on | other posts from the same category, below an article |
| `prev-next` | off | links to adjacent posts. Off by default because it duplicates the related list on blogs with small categories |

Settings left empty are hidden rather than rendered blank.

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

Three groups sit outside those palettes deliberately: the code block, which
keeps one dark set for both themes; the image lightbox, which is always dark;
and the print stylesheet.

Text placed on the accent colour is chosen by measurement — the skin compares
the accent against black and white and uses whichever gives higher contrast.

## Browser support

Compiled for Chrome, Edge and Firefox 100+, Safari and iOS 15+, and Samsung
Internet 16+.

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
file, and writes a reproducible archive with its SHA-256: identical inputs
produce identical bytes.

The mock preview is a local stand-in for Tistory and uses its own markup, so it
is useful for layout work but does not verify the skin itself.

Skin thumbnails are generated by opening `scripts/make-previews.html` in a
browser; place the resulting files in `src/assets/`.

## Documents

| Document | Contents |
| --- | --- |
| [docs/product.md](docs/product.md) | what the skin is for, and the rules the design follows |
| [docs/tistory-spec.md](docs/tistory-spec.md) | Tistory platform behaviour, verified and open |
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
