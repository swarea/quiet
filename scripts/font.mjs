// Cut Pretendard down to what this skin sets and ship it, so the typeface the
// design was drawn for does not depend on a third party staying up.
//
// Two files, because the weight axis costs almost nothing for Latin and almost
// everything for Hangul. Measured at build:
//
//   Latin,  variable axis   53 KB      Hangul, variable axis  1663 KB
//   Latin,  static 400      27 KB      Hangul, static 400      568 KB
//                                      Hangul, static 700      676 KB
//
// So Latin keeps a live 300-800 axis and Hangul ships as one static instance at
// 400. Bold Hangul is then synthesised by the browser, which is a fair trade
// here: the headings on this blog are mostly Latin, and a real bold Hangul costs
// another 676 KB.
//
// `variationAxes` instances the font; it does not narrow the axis. Passing
// `{wght:{min:300,max:800}}` produced a file pinned at 400 that the stylesheet
// then declared as `font-weight:300 800` -- so the browser believed it had every
// weight, declined even to synthesise, and every bold on the page rendered at
// 400. Omitting the option entirely is what keeps a font variable.
//
// The family is renamed. Pretendard is OFL 1.1 with a Reserved Font Name, and a
// subset is a modified version; shipping a modification under the reserved name
// is the one thing that licence asks you not to do.
import subsetFont from "subset-font";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const FAMILY = "Quiet Sans";
const SOURCE = join(root, "src", "fonts", "source.woff2");


const range = (from, to) => {
  let out = "";
  for (let i = from; i <= to; i++) out += String.fromCodePoint(i);
  return out;
};

// Latin, and the punctuation a post reaches for.
const LATIN =
  range(0x20, 0x7e) + // ASCII
  range(0xa0, 0xff) + // Latin-1 supplement
  range(0x0100, 0x017f) + // Latin Extended-A, for names and loanwords
  "‘’“”„–—…·•※→←↑↓×÷≈≤≥±°′″§¶†‡←→⟨⟩";

// The whole Hangul syllable block, because there is no useful way to guess which
// of the 11,172 a blog will use, and a subset guessed from today's posts is a gap
// in tomorrow's.
const HANGUL =
  range(0xac00, 0xd7a3) + // syllables
  range(0x3130, 0x318f) + // compatibility jamo
  range(0x1100, 0x11ff); // jamo, for text that arrives decomposed

export async function buildFont() {
  const source = await readFile(SOURCE);
  // No variationAxes: that option instances rather than narrows, and an instanced
  // file under a range declaration is what flattened every weight on the page.
  const latin = await subsetFont(source, LATIN, { targetFormat: "woff2" });
  const hangul = await subsetFont(source, HANGUL, {
    targetFormat: "woff2",
    variationAxes: { wght: 400 },
  });
  return {
    family: FAMILY,
    sourceBytes: source.length,
    latin: { data: latin, bytes: latin.length, codepoints: new Set([...LATIN]).size },
    hangul: { data: hangul, bytes: hangul.length, codepoints: new Set([...HANGUL]).size },
  };
}

if (process.argv[1] && process.argv[1].endsWith("font.mjs")) {
  const r = await buildFont();
  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  console.log(`${r.family} latin  ${kb(r.latin.bytes)}  variable 300-800  ${r.latin.codepoints} codepoints`);
  console.log(`${r.family} hangul ${kb(r.hangul.bytes)}  static 400        ${r.hangul.codepoints} codepoints`);
  console.log(`source ${kb(r.sourceBytes)}`);
}
