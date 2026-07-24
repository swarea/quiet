# tistory-skin

An original Tistory skin by [swarea](https://github.com/swarea) — quiet, modern,
reading-first. Built from scratch; not a derivative of any existing skin.

> **Status: pre-0.1.0 foundation.** Nothing here is installable yet, and
> nothing has been verified on a real Tistory blog. See
> [docs/roadmap.md](docs/roadmap.md) for milestones.

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
