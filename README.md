# Quiet

Quiet is a Tistory skin for reading. A 50rem column, light and dark drawn
separately, and Tistory's own comment box and post toolbar restyled to match the
rest of the page.

Built from scratch by [swarea](https://github.com/swarea). Not a derivative of
any existing skin, and not affiliated with Tistory or Kakao.

> **Status: 0.2.1, unreleased.** 0.2.0 is the published release. Every screen
> has now been opened on a live Tistory blog; what is still unproven is listed
> under [Known limitations](#known-limitations). See [docs/roadmap.md](docs/roadmap.md).

## What it does

- A reading column set for Korean and Latin together, on a palette meant for
  hours rather than for a screenshot.
- **Light and dark, each designed.** The reader's system decides; their own
  choice, once made, decides instead and is remembered.
- **A contents rail** beside long posts, a **folding category tree**, **copy
  buttons** on code, and **zoom** on images.
- **Tistory's own parts, restyled.** The comment box, the post toolbar and the
  share panel match the rest of the page, icons included.
- Text pasted into a post keeps the author's colours, unless a colour would be
  unreadable in the theme the reader chose.

## Install

1. Download the release archive, or run `npm run build` and take `dist/`.
2. In your blog: skin editor, HTML/CSS edit.
3. Upload every file, including everything under `images/`. A missing file in
   `images/` is the usual cause of a skin that never finishes loading.

What the package contains:

| File | What it is |
| --- | --- |
| `skin.html` | the template, with Tistory's substitution tokens |
| `style.css` | compiled stylesheet |
| `index.xml` | skin metadata, covers, and settings |
| `images/app.js` | progressive enhancement bundle |
| `preview.gif`, `preview*.jpg` | thumbnails shown in the skin list |

### Blog settings this skin expects

- **Menu bar**. Set the blog menu bar to display, so the Tistory menu stays
  reachable.
- **Mobile web**. Turn Tistory's automatic mobile web off. This skin is
  responsive and handles narrow screens itself.
- **Covers**. The home page is composed from covers. With none enabled, Tistory
  serves the plain post list and home looks the same as the category archive.
  Four cover types are offered: **소개** for the opening band, **리스트** for a
  column of posts, **대표 글** to stand one post up with its picture beside it,
  and **주제 묶음** for a grid by category. The opening band takes its small
  line from the cover's own title and its headline and lede from a single
  hand-entered item.

### Settings

| Setting | Default | Effect |
| --- | --- | --- |
| `home-eyebrow` | empty | a short line above the headline. Hidden when empty |
| `home-headline` | empty | the opening line on the home page. Empty leaves Tistory's own list title |
| `home-tagline` | empty | a line under the headline. Shown only when the headline is set |
| `accent-light` | `#38548c` | the colour of links and emphasis on a light page |
| `accent-dark` | `#90a8e0` | the same, for dark. Pick something that reads on a dark ground |
| `theme` | follow the visitor | which theme a first-time reader sees. Their own choice always wins afterwards |
| `sidebar` | on | the fixed navigation column on wide screens |
| `toc` | on | the contents rail beside an article, and the panel on narrow screens |
| `reading-progress` | on | the thin progress line at the top of the window, on every page |
| `related-posts` | on | other posts from the same category, under an article |
| `prev-next` | off | links to the posts either side of the one being read. Off by default because on a blog whose categories are small it repeats the related list directly above it |

## Known limitations

- **Dark mode has been read, not seen.** Every colour pair is resolved from the
  tokens and checked by the gate, and the panels Tistory injects were measured
  against its own stylesheet in production load order. What has not happened is
  a person looking at every screen in dark mode.
- **The home page needs covers enabled** to differ from the category archive.
  With none enabled Tistory serves the plain post list, and the skin cannot
  override that from its side.
- **Search and posting a comment need JavaScript.** Tistory drives both itself,
  so no skin can offer them without it. The rest of the page still works.
- **The page title stays in Tistory's wording.** The heading is translated where
  the phrase is Tistory's own, but `<title>` is left as Tistory writes it: it is
  what search engines index for a blog whose posts are Korean.

### Changing more than the settings

Every colour that changes with the theme derives from two palettes declared at
the top of `style.css` as `--light-*` and `--dark-*`. Overriding one of those in
the skin editor recolours everything that uses it, rather than one rule at a
time:

```css
:root{ --light-surface-2:#f6f4ef; --dark-surface-2:#232830; }
```

Three things sit outside those palettes on purpose: the code block, which
keeps one dark set for both themes; the image lightbox, which is always dark;
and the print stylesheet, which is always on paper.

Whatever accent is chosen, the text laid on it is decided by measurement rather
than assumption: the skin compares the accent against black and white and takes
whichever a reader can actually read.

## Browser support

Compiled for Chrome, Edge and Firefox 100+, Safari and iOS 15+, and Samsung
Internet 16+. The gate checks the two things the compiler is asked to rewrite
and can silently fail to: modern media-range syntax, and `color-mix` without a
fallback. Everything newer than the targets is guarded in the stylesheet by
hand — `:has()` behind `@supports` — rather than caught by the gate.

## Develop

```bash
npm install
npm run preview   # build + serve the mock preview at http://localhost:4321
npm run build     # build the mock preview and the installable package
npm run check     # validation gate (see scripts/check.mjs)
npm run release   # gate + build + versioned archive in release/
```

`npm run release` refuses a dirty working tree, refuses a package missing any
file the skin spec requires, and writes a reproducible archive with its SHA-256.
The same inputs always produce the same bytes, so the checksum identifies the
build rather than the moment it was made.

`npm run build` writes the installable package to `dist/`. The mock preview is a
local stand-in for Tistory, useful for layout work. A pass there is not a pass
on Tistory, and this project does not report it as one.

Skin thumbnails are generated once by opening `scripts/make-previews.html` in a
browser and pressing the button; drop the resulting JPEGs into `src/assets/` and
every build packages them.

## Documents

- [docs/product.md](docs/product.md): what this skin is and its principles
- [docs/tistory-spec.md](docs/tistory-spec.md): Tistory platform constraints
  and the clean-room policy
- [docs/roadmap.md](docs/roadmap.md): release milestones and gates
- [docs/decisions/](docs/decisions/): architecture decision records
- [CONTRIBUTING.md](CONTRIBUTING.md): workflow rules (single source)
- [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md): the typeface and the build
  tools

## Built with

Nunjucks templates, plain CSS with custom properties, and vanilla TypeScript,
compiled by esbuild and Lightning CSS into the official Tistory package.
Rationale in [ADR-0001](docs/decisions/ADR-0001-build-architecture.md).

## License

[MIT](LICENSE). Use it, change it, redistribute it; keep the copyright notice.
The Pretendard typeface is requested at runtime under the SIL Open Font License
1.1 and is not redistributed here. See
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
