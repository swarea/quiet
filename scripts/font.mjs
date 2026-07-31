// Cut Pretendard down to what this skin actually sets and ship it, so the
// typeface the design was drawn for does not depend on a third party staying up.
//
// Latin and Hangul both. Measured at build: Latin alone is 51 KB, Latin with the
// full Hangul syllable block is 596 KB, and the whole font is 2.0 MB. Narrowing
// the weight axis makes it worse rather than better -- 400-700 came out at
// 1152 KB, because a narrower range has to interpolate new masters where the
// wider one can keep the ones already in the file.
//
// Latin alone was the earlier decision, on the reasoning that Korean is
// irreducible in one file and the reader's own Hangul is a fair substitute --
// Pretendard's metrics follow Apple SD Gothic Neo, so on Apple hardware the
// fallback is close to the thing it imitates. That reasoning held for a mobile
// audience and this blog does not have one. Measured on a live blog: 91.4% of
// its readers are on a desktop, which in Korea means Malgun Gothic, which is
// visibly older than the rest of the page. See ADR-0004.
//
// The family is renamed. Pretendard is OFL 1.1 with a Reserved Font Name, and a
// subset is a modified version; shipping a modification under the reserved name
// is the one thing that licence asks you not to do. "Quiet Sans" carries no
// claim to be Pretendard, and the licence travels with the file.
import subsetFont from "subset-font";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const FAMILY = "Quiet Sans";
const SOURCE = join(root, "src", "fonts", "source.woff2");


const range = (from, to) => {
  let out = "";
  for (let i = from; i <= to; i++) out += String.fromCodePoint(i);
  return out;
};

// Latin, the punctuation a post reaches for, and the whole Hangul syllable
// block. Hangul is taken entire because there is no useful way to guess which of
// the 11,172 syllables a blog will use -- a subset guessed from today's posts is
// a gap in tomorrow's. Anything outside this still falls through to the reader's
// own fonts, which is the correct outcome rather than a hole.
const COVERAGE =
  range(0x20, 0x7e) + // ASCII
  range(0xa0, 0xff) + // Latin-1 supplement
  range(0x0100, 0x017f) + // Latin Extended-A, for names and loanwords
  range(0xac00, 0xd7a3) + // Hangul syllables
  range(0x3130, 0x318f) + // Hangul compatibility jamo
  range(0x1100, 0x11ff) + // Hangul jamo, for text that arrives decomposed
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
