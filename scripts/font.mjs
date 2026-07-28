// Cut the Latin half of Pretendard out of the full variable font and ship it
// with the skin, so the typeface the design was drawn for does not depend on a
// third party staying up.
//
// Only Latin. Measured from the 1.3.9 release: Latin alone is 46 KB, Latin plus
// the common Hangul syllables is 821 KB, and everything is 1.7 MB. Korean is
// irreducible in a single file — there are 11,172 syllables and no useful way
// to guess which ones a blog will use. So Korean is left to the reader's own
// system font, which is what Pretendard was drawn to sit beside: its metrics
// follow Apple SD Gothic Neo, the default on the platform it was designed
// against. Latin from us, Hangul from the system, is a pairing the typeface
// expects rather than an accident of fallback.
//
// The family is renamed. Pretendard is OFL 1.1 with a Reserved Font Name, and a
// subset is a modified version; shipping a modification under the reserved name
// is the one thing that licence asks you not to do. "Quiet Latin" carries no
// claim to be Pretendard, and the licence travels with the file.
import subsetFont from "subset-font";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const FAMILY = "Quiet Latin";
const SOURCE = join(root, "src", "fonts", "source.woff2");


const range = (from, to) => {
  let out = "";
  for (let i = from; i <= to; i++) out += String.fromCodePoint(i);
  return out;
};

// Basic Latin, Latin-1, and the punctuation a post written in English actually
// reaches for. Anything outside this falls through to the reader's own fonts,
// which is the correct outcome rather than a gap.
const COVERAGE =
  range(0x20, 0x7e) + // ASCII
  range(0xa0, 0xff) + // Latin-1 supplement
  range(0x0100, 0x017f) + // Latin Extended-A, for names and loanwords
  "‘’“”„–—…·•※→←↑↓×÷≈≤≥±°′″§¶†‡←→⟨⟩";

export async function buildFont() {
  const source = await readFile(SOURCE);
  const subset = await subsetFont(source, COVERAGE, {
    targetFormat: "woff2",
    variationAxes: { wght: { min: 300, max: 800 } },
  });
  return {
    family: FAMILY,
    data: subset,
    bytes: subset.length,
    sourceBytes: source.length,
    codepoints: new Set([...COVERAGE]).size,
  };
}

if (process.argv[1] && process.argv[1].endsWith("font.mjs")) {
  const r = await buildFont();
  const kb = (n) => (n / 1024).toFixed(0);
  console.log(
    `${r.family}: ${kb(r.bytes)} KB from ${kb(r.sourceBytes)} KB, ${r.codepoints} codepoints`,
  );
}
