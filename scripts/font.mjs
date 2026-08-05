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
//
// That rename has to happen in the file. Declaring `font-family: Quiet Sans` in
// the stylesheet only says what CSS calls the file; the name the font presents
// is in its own `name` table, and `subset-font` cannot touch it -- there is no
// option for it, only one for which name ids to keep. For three releases this
// constant was a label on a return value and nothing else, and every shipped
// subset still called itself "Pretendard Variable".
//
// So the subset comes out uncompressed, `renameFont` rewrites the table, and
// `fontverter` -- which subset-font uses internally for exactly this -- puts it
// back into woff2.
import subsetFont from "subset-font";
import { convert } from "fontverter";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renameFont } from "./font-rename.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const FAMILY = "Quiet Sans";
// Applied in order: the spaced form has to be tried first, or the unspaced rule
// would match inside it and leave "Quiet Sans Variable" behind.
const RENAME = [
  ["Pretendard Variable", FAMILY],
  ["PretendardVariable", FAMILY.replace(/ /g, "")],
  ["Pretendard", FAMILY],
];
// 13 and 14 are the licence and the link to it. harfbuzz drops both by default,
// which left the shipped files carrying a copyright with no licence beside it.
const KEEP_NAME_IDS = [13, 14];
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

// Subset, rename, compress. The subset is asked for uncompressed because the
// rename reads and rewrites the table directory, which woff2 does not expose.
async function cut(source, text, options) {
  const sfnt = await subsetFont(source, text, {
    ...options,
    targetFormat: "truetype",
    preserveNameIds: KEEP_NAME_IDS,
  });
  const { font, renamed } = renameFont(sfnt, RENAME);
  if (!renamed) {
    // The source is what it is: if nothing matched, either the upstream font
    // changed its name or the rename silently stopped working. Both need
    // looking at before a package goes out under a name that is not ours.
    throw new Error("no name record was renamed -- the subset would ship under the reserved name");
  }
  return { data: await convert(font, "woff2"), renamed };
}

export async function buildFont() {
  const source = await readFile(SOURCE);
  // No variationAxes: that option instances rather than narrows, and an instanced
  // file under a range declaration is what flattened every weight on the page.
  const latin = await cut(source, LATIN, {});
  const hangul = await cut(source, HANGUL, { variationAxes: { wght: 400 } });
  return {
    family: FAMILY,
    sourceBytes: source.length,
    latin: { data: latin.data, bytes: latin.data.length, codepoints: new Set([...LATIN]).size },
    hangul: { data: hangul.data, bytes: hangul.data.length, codepoints: new Set([...HANGUL]).size },
  };
}

if (process.argv[1] && process.argv[1].endsWith("font.mjs")) {
  const r = await buildFont();
  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  console.log(`${r.family} latin  ${kb(r.latin.bytes)}  variable 300-800  ${r.latin.codepoints} codepoints`);
  console.log(`${r.family} hangul ${kb(r.hangul.bytes)}  static 400        ${r.hangul.codepoints} codepoints`);
  console.log(`source ${kb(r.sourceBytes)}`);
}
