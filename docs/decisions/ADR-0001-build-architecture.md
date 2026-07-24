# ADR-0001: Build and template architecture

## Status

Accepted

## Context

Tistory skins are a static package (`skin.html` + `style.css` + `index.xml` +
`images/`). The reference skin we inspected keeps only minified bundles in the
repo, which makes it unmaintainable. We need human-readable sources, a build
that cannot corrupt Tistory's `[##_..._##]` tokens or `<s_*>` pseudo-tags, and
reproducible output from a clean clone. No application framework is needed —
the deliverable is one HTML file.

## Decision

- **Templates:** Nunjucks partials under `src/templates/`, assembled by a small
  Node build script into a single `dist/skin.html`. Nunjucks is chosen because
  its syntax (`{% ... %}`, `{{ ... }}`) cannot collide with Tistory's
  `[##_..._##]` tokens, which pass through as plain text.
- **Styles:** plain CSS with custom properties (design tokens), one file per
  component/view under `src/styles/`, concatenated + minified by
  **Lightning CSS** into `dist/style.css`. No Tailwind, no Sass.
- **Scripts:** vanilla TypeScript modules under `src/scripts/`, bundled by
  **esbuild** into a single `dist/images/app.js`. Each module exits silently
  when its target element is absent; one module's failure must not stop others.
- **No HTML minifier** in the pipeline. `skin.html` ships as the template
  assembly emits it; a validation step asserts every Tistory token in `src/`
  survives byte-identical in `dist/`.
- **Mock preview:** the same Nunjucks components render preview pages with
  fixture data (a tiny resolver replaces `[##_..._##]` tokens from fixtures),
  served statically. Mock preview never counts as Tistory verification.
- **Class scoping:** all skin classes use the `sw-` prefix to avoid collisions
  with Tistory-injected markup and plugins.
- `dist/` is git-ignored; installable output comes from CI artifacts and
  release ZIPs. `package-lock.json` is committed.

## Alternatives considered

- **Hand-edit a single skin.html** — no components, guarantees drift between
  preview and skin; rejected.
- **Tailwind CSS** — utility soup in templates hurts readability, and the
  reference skin shows the failure mode; semantic CSS with tokens is easier to
  maintain solo for years; rejected.
- **React/Vite/Next static export** — runtime and build complexity with zero
  benefit for a single-file template that Tistory fills server-side; rejected.
- **Eleventy/Astro as site framework** — brings routing/data layers we don't
  need; a ~100-line build script keeps full control over token preservation;
  rejected.
- **Handlebars/EJS instead of Nunjucks** — comparable; Nunjucks wins on
  template inheritance + include ergonomics and unambiguous token coexistence.

## Consequences

- One extra concept (template assembly) between source and output, paid for by
  component reuse across skin and preview.
- esbuild + Lightning CSS + Nunjucks are the only build dependencies; all are
  removable individually (plain CSS concat, plain JS) if abandoned upstream.
- Browser targets and size budgets are set after first real builds (0.5.0),
  recorded in this file's follow-ups or the quality gate.

## Validation

- `scripts/check` asserts: required dist files exist, tokens preserved,
  no duplicate static IDs, XML well-formed, budgets (once set).
- Real verification happens on a test Tistory blog per docs/tistory-spec.md.
