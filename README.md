# tistory-skin

An original Tistory skin by [swarea](https://github.com/swarea) — quiet, modern,
reading-first. Built from scratch; not a derivative of any existing skin.

> **Status: 0.1.0 foundation in progress.** The design direction is chosen and
> implemented as a mock preview; nothing is packaged for or verified on a real
> Tistory blog yet (that is 0.2.0). See [docs/roadmap.md](docs/roadmap.md).

## Develop

```bash
npm install
npm run preview   # build + serve the mock preview at http://localhost:4321
npm run build     # build the mock preview into preview/dist
npm run check     # validation gate (9 checks; see scripts/check.mjs)
```

The build writes the installable Tistory package to `dist/`
(`skin.html`, `index.xml`, `style.css`, `images/app.js`). Upload those four
files in the blog's skin editor.

Skin thumbnails are generated once by opening `scripts/make-previews.html` in a
browser and pressing the button; drop the resulting JPEGs into `src/assets/` and
every build packages them.

## Documents

- [docs/product.md](docs/product.md) — what this skin is and its principles
- [docs/tistory-spec.md](docs/tistory-spec.md) — Tistory platform constraints
  and the clean-room policy
- [docs/roadmap.md](docs/roadmap.md) — release milestones and gates
- [docs/decisions/](docs/decisions/) — architecture decision records
- [docs/design-directions/](docs/design-directions/) — the three candidate
  design directions (open the HTML files in a browser)
- [CONTRIBUTING.md](CONTRIBUTING.md) — workflow rules (single source)

## Planned toolchain

Nunjucks templates + plain CSS (custom properties) + vanilla TypeScript,
built with esbuild and Lightning CSS into the official Tistory package
(`skin.html`, `style.css`, `index.xml`, `images/`, previews). Rationale in
[ADR-0001](docs/decisions/ADR-0001-build-architecture.md).

License: not yet decided (tracked as a `type:decision` issue).
