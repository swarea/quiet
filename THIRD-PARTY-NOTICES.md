# Third-party notices

## Pretendard

The skin requests the Pretendard typeface at runtime for readers whose browser
can fetch it. Pretendard is not bundled or redistributed in this repository.

- Project: <https://github.com/orioncactus/pretendard>
- Copyright: © Kil Hyung-jin
- License: SIL Open Font License 1.1 — <https://openfontlicense.org>

Delivered from jsDelivr as a dynamic subset, so only the glyph ranges a page
actually uses are downloaded. The stylesheet is loaded non-blocking; if the CDN
is unreachable the skin renders in the system font stack instead.

## Build tools

Development dependencies only, not shipped in the skin package:

- esbuild — MIT
- Lightning CSS — MPL-2.0
- Nunjucks — BSD-2-Clause

Full texts are in each package under `node_modules/`.
