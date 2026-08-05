// Rewrite the family name inside a font binary.
//
// Pretendard is OFL 1.1 with a Reserved Font Name, and clause 3 forbids a
// modified version from carrying that name as the one presented to users. A
// subset is a modified version, so the files this project ships have to name
// themselves something else.
//
// Declaring `font-family: Quiet Sans` in the stylesheet does not do that. That
// is the name CSS calls the file by; the name the font answers to is in its own
// `name` table, and for three releases the shipped subsets still said
// "Pretendard Variable" there -- in the family, the full name, the PostScript
// name and the unique id. `scripts/font.mjs` had a `FAMILY` constant that was
// only ever a label on its return value, and `subset-font` has no option to
// rename anything: its choices are which name ids to *keep*.
//
// So the rename happens here, between subsetting and compression, and the gate
// asserts the result.
//
// What is renamed and what is not:
//
//   renamed    the names that identify the font -- family, full name,
//              PostScript name, unique id, typographic and WWS family, and the
//              PostScript name of every named instance in a variable font
//   left alone copyright, trademark, licence, licence url, and the vendor and
//              designer records
//
// The second list is not an oversight. OFL 1.1 asks that the copyright and the
// licence travel with the font; the restriction is on the name it presents,
// not on the credit it carries. Stripping "Pretendard" out of the copyright
// line would break the licence in the course of complying with it.

// Every record whose value is a name for this font rather than a fact about
// where it came from. 16-22 are the typographic and WWS families; 25 is the
// prefix a variable font builds instance PostScript names from.
const IDENTIFYING = new Set([1, 3, 4, 6, 16, 17, 18, 20, 21, 22, 25]);

// A named instance's PostScript name (`PretendardVariable-SemiBold`) is stored
// in a record the font points at from `fvar`, numbered from 256 up. They carry
// the family name too, so they are renamed with the rest.
const isIdentifying = (nameID) => IDENTIFYING.has(nameID) || nameID >= 256;

const align4 = (n) => (n + 3) & ~3;

// The OpenType table checksum: the table read as big-endian uint32s, padded
// with zeroes, summed and truncated to 32 bits.
function checksum(buf) {
  let sum = 0;
  const padded = align4(buf.length);
  for (let i = 0; i < padded; i += 4) {
    let word = 0;
    for (let j = 0; j < 4; j++) word = (word << 8) | (i + j < buf.length ? buf[i + j] : 0);
    sum = (sum + (word >>> 0)) >>> 0;
  }
  return sum;
}

// Platform 3 is Windows and stores UTF-16BE; platform 1 is the old Macintosh
// encoding, which is Latin-1 for everything this font carries. Node has no
// UTF-16BE codec, so the bytes are swapped into the little-endian one it does
// have -- on a copy, because `swap16` works in place.
function decode(buf, platformID) {
  if (platformID !== 3) return buf.toString("latin1");
  return Buffer.from(buf).swap16().toString("utf16le");
}

function encode(text, platformID) {
  return platformID === 3
    ? Buffer.from(text, "utf16le").swap16()
    : Buffer.from(text, "latin1");
}

// Rebuilt rather than patched in place, so a longer replacement cannot corrupt
// the table and the string storage never accumulates orphans.
function buildNameTable(records) {
  const header = Buffer.alloc(6 + records.length * 12);
  header.writeUInt16BE(0, 0); // format 0
  header.writeUInt16BE(records.length, 2);
  header.writeUInt16BE(header.length, 4); // storage begins after the records

  const strings = [];
  let at = 0;
  records.forEach((r, i) => {
    const o = 6 + i * 12;
    header.writeUInt16BE(r.platformID, o);
    header.writeUInt16BE(r.encodingID, o + 2);
    header.writeUInt16BE(r.languageID, o + 4);
    header.writeUInt16BE(r.nameID, o + 6);
    header.writeUInt16BE(r.data.length, o + 8);
    header.writeUInt16BE(at, o + 10);
    strings.push(r.data);
    at += r.data.length;
  });
  return Buffer.concat([header, ...strings]);
}

/**
 * Read a font's `name` table.
 *
 * Exported so the gate can assert what the shipped files call themselves rather
 * than trusting that this module ran.
 *
 * @param {Buffer} sfnt an uncompressed font
 * @returns {Array<{nameID: number, text: string}>}
 */
export function readNames(sfnt) {
  const numTables = sfnt.readUInt16BE(4);
  let name = null;
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    if (sfnt.toString("ascii", o, o + 4) === "name") {
      name = { offset: sfnt.readUInt32BE(o + 8), length: sfnt.readUInt32BE(o + 12) };
      break;
    }
  }
  if (!name) throw new Error("the font has no name table");
  const table = sfnt.subarray(name.offset, name.offset + name.length);
  const count = table.readUInt16BE(2);
  const storage = table.readUInt16BE(4);
  const out = [];
  for (let i = 0; i < count; i++) {
    const o = 6 + i * 12;
    const at = storage + table.readUInt16BE(o + 10);
    out.push({
      nameID: table.readUInt16BE(o + 6),
      identifying: isIdentifying(table.readUInt16BE(o + 6)),
      text: decode(table.subarray(at, at + table.readUInt16BE(o + 8)), table.readUInt16BE(o)),
    });
  }
  return out;
}

/**
 * Replace the font's own name wherever it identifies itself.
 *
 * @param {Buffer} sfnt   an uncompressed font (`targetFormat: "truetype"`)
 * @param {Array<[string, string]>} pairs  from-to, applied in order, so the
 *   spaced form has to come before the unspaced one or it never matches
 * @returns {Buffer} the same font, renamed
 */
export function renameFont(sfnt, pairs) {
  const numTables = sfnt.readUInt16BE(4);
  const directory = [];
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    directory.push({
      tag: sfnt.toString("ascii", o, o + 4),
      offset: sfnt.readUInt32BE(o + 8),
      length: sfnt.readUInt32BE(o + 12),
    });
  }

  const name = directory.find((t) => t.tag === "name");
  if (!name) throw new Error("the font has no name table to rename");
  const table = sfnt.subarray(name.offset, name.offset + name.length);

  const format = table.readUInt16BE(0);
  if (format !== 0) {
    // Format 1 adds language-tag records this does not carry across. No font
    // this project ships uses it, and silently dropping them would be worse
    // than refusing.
    throw new Error(`name table format ${format} is not supported`);
  }

  const count = table.readUInt16BE(2);
  const storage = table.readUInt16BE(4);
  const records = [];
  let renamed = 0;
  for (let i = 0; i < count; i++) {
    const o = 6 + i * 12;
    const platformID = table.readUInt16BE(o);
    const nameID = table.readUInt16BE(o + 6);
    const length = table.readUInt16BE(o + 8);
    const at = storage + table.readUInt16BE(o + 10);
    let data = Buffer.from(table.subarray(at, at + length));

    if (isIdentifying(nameID)) {
      const before = decode(data, platformID);
      let after = before;
      for (const [from, to] of pairs) after = after.split(from).join(to);
      if (after !== before) {
        data = encode(after, platformID);
        renamed++;
      }
    }
    records.push({
      platformID,
      encodingID: table.readUInt16BE(o + 2),
      languageID: table.readUInt16BE(o + 4),
      nameID,
      data,
    });
  }

  // Reassemble. Tables keep their order and are laid out 4-byte aligned, which
  // is where the directory's offsets come from -- so they are written after the
  // layout is known, not carried over from the input.
  const tables = directory.map((t) => ({
    tag: t.tag,
    data: t.tag === "name" ? buildNameTable(records) : Buffer.from(sfnt.subarray(t.offset, t.offset + t.length)),
  }));

  const headerSize = 12 + tables.length * 16;
  const out = Buffer.alloc(headerSize + tables.reduce((n, t) => n + align4(t.data.length), 0));
  sfnt.copy(out, 0, 0, 12); // sfntVersion and the binary-search fields are unchanged

  let cursor = headerSize;
  tables.forEach((t, i) => {
    const o = 12 + i * 16;
    out.write(t.tag, o, 4, "ascii");
    out.writeUInt32BE(checksum(t.data), o + 4);
    out.writeUInt32BE(cursor, o + 8);
    out.writeUInt32BE(t.data.length, o + 12);
    t.data.copy(out, cursor);
    cursor += align4(t.data.length);
  });

  // `head.checkSumAdjustment` is a checksum of the whole file, so it is computed
  // last and with its own four bytes zeroed. A stale one is ignored by every
  // renderer worth naming, and wrong is still wrong.
  const head = tables.findIndex((t) => t.tag === "head");
  if (head >= 0) {
    const at = out.readUInt32BE(12 + head * 16 + 8) + 8;
    out.writeUInt32BE(0, at);
    out.writeUInt32BE((0xb1b0afba - checksum(out)) >>> 0, at);
  }

  return { font: out, renamed };
}
