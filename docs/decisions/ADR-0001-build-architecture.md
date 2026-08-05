# ADR-0001: Build and template architecture

## Status

Accepted, and amended — see [Amendment](#amendment-what-was-actually-built).

## Context

Tistory skins are a static package (`skin.html` + `style.css` + `index.xml` +
`images/`). Tistory serves the uploaded files directly, so whatever is uploaded
is what must be maintained. This project therefore needs human-readable sources
that compile to that package, a build that cannot corrupt Tistory's
`[##_..._##]` tokens or `<s_*>` pseudo-tags, and reproducible output from a
clean clone. No application framework is needed: the deliverable is one HTML
file.

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
- **Class scoping:** all skin classes use the `quiet-` prefix to avoid collisions
  with Tistory-injected markup and plugins.
- `dist/` is git-ignored; installable output comes from CI artifacts and
  release ZIPs. `package-lock.json` is committed.

## Alternatives considered

- **Hand-edit a single skin.html** — no components, guarantees drift between
  preview and skin; rejected.
- **Tailwind CSS** — utility classes in the template make the markup harder to
  read, and Tistory's own injected markup would still need conventional CSS.
  Semantic classes with design tokens are easier to maintain over years by one
  person; rejected.
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
  Two were added later for the typeface, which this decision predates:
  subset-font in [ADR-0003](ADR-0003-bundled-latin.md), and fontverter beside it
  once the subset had to be renamed before it was compressed.
- Browser targets and size budgets are set after first real builds (0.5.0),
  recorded in this file's follow-ups or the quality gate.

## Validation

- `scripts/check.mjs` asserts: required dist files exist, tokens preserved,
  no duplicate static IDs, XML well-formed, budgets (once set).
- Real verification happens on a test Tistory blog per docs/tistory-spec.md.

## Amendment: what was actually built

The template half of this decision did not survive contact with the skin.
`skin.html` is written by hand in `src/` and copied into `dist/` byte-identical
(`scripts/build.mjs`); Nunjucks builds only the mock preview from a separate set
of views under `src/templates/`, with fixture objects rather than the token
resolver described above. The styles and scripts halves are as decided.

Why the split happened is not recorded, and this amendment does not invent a
reason. What can be said is that the consequence this ADR predicted for the
rejected alternative — "no components, guarantees drift between preview and
skin" — is the one the project actually pays. The preview has drifted from the
skin repeatedly: a featured block whose class the skin no longer emitted, a
list heading missing the class the skin styles it by, a home page still built
from markup whose rules had been deleted as dead. Each was found by measuring
the preview against the skin rather than by anything in the build.

The gate does not catch this class of fault, and the two are only kept in step
by hand. Either the preview should be generated from `skin.html` with the tokens
resolved — the original decision — or the drift should be checked for. Until one
of those happens, a pass in the preview says less than this ADR assumes.
