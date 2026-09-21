#!/usr/bin/env node
/**
 * docx-text.js
 *
 * Zero-dependency DOCX reader. Extracts the text an ATS parser would see,
 * in reading order, plus the structural facts that decide whether a parser
 * will choke (tables, text boxes, images, headers/footers, columns, hidden
 * or white text, fonts, page setup).
 *
 * Node >= 18. No npm packages: the zip is read with node:zlib.
 *
 * CLI:
 *   node docx-text.js resume.docx            # plain text to stdout
 *   node docx-text.js resume.docx --json     # {text, paragraphs, structure}
 *
 * Module:
 *   const { readDocx } = require("./docx-text");
 *   const { text, paragraphs, structure } = readDocx("resume.docx");
 */

const fs = require("fs");
const zlib = require("zlib");

// ------------------------------------------------------------------
// Minimal zip reader (central directory driven; handles data descriptors)
// ------------------------------------------------------------------

function readZipEntries(buf) {
  const EOCD_SIG = 0x06054b50;
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("not a zip file (no end-of-central-directory record)");

  const entryCount = buf.readUInt16LE(eocd + 10);
  let ptr = buf.readUInt32LE(eocd + 16);
  const entries = new Map();

  for (let n = 0; n < entryCount; n++) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) throw new Error("corrupt zip central directory");
    const method = buf.readUInt16LE(ptr + 10);
    const compressedSize = buf.readUInt32LE(ptr + 20);
    const nameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localOffset = buf.readUInt32LE(ptr + 42);
    const name = buf.toString("utf8", ptr + 46, ptr + 46 + nameLen);

    // Local header: name/extra lengths can differ from the central record.
    const localNameLen = buf.readUInt16LE(localOffset + 26);
    const localExtraLen = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const raw = buf.subarray(dataStart, dataStart + compressedSize);

    entries.set(name, { method, raw });
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function inflateEntry(entry) {
  if (entry.method === 0) return entry.raw.toString("utf8");
  if (entry.method === 8) return zlib.inflateRawSync(entry.raw).toString("utf8");
  throw new Error(`unsupported zip compression method ${entry.method}`);
}

// ------------------------------------------------------------------
// XML helpers (regex based; document.xml from Word/docx-js is regular enough)
// ------------------------------------------------------------------

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
}

function paragraphText(pXml) {
  // Walk runs in order: text, tabs, line breaks. Skip deleted text (<w:delText>).
  let out = "";
  const tokenRe = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\s*\/>|<w:br\s*\/>|<w:cr\s*\/>|<w:noBreakHyphen\s*\/>|<w:sym\s[^>]*\/>/g;
  let m;
  while ((m = tokenRe.exec(pXml)) !== null) {
    if (m[0].startsWith("<w:t")) out += decodeEntities(m[1]);
    else if (m[0].startsWith("<w:tab")) out += "\t";
    else if (m[0].startsWith("<w:br") || m[0].startsWith("<w:cr")) out += "\n";
    else if (m[0].startsWith("<w:noBreakHyphen")) out += "-";
    else out += "�"; // symbol glyph: a parser sees garbage here
  }
  return out;
}

function paragraphMeta(pXml) {
  const pPr = (pXml.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/) || [, ""])[1];
  const isBullet = /<w:numPr>/.test(pPr);
  const styleId = (pPr.match(/<w:pStyle w:val="([^"]+)"/) || [, ""])[1];
  const runProps = [...pXml.matchAll(/<w:rPr>([\s\S]*?)<\/w:rPr>/g)].map((r) => r[1]).join(" ");
  const allBold = (() => {
    const runs = [...pXml.matchAll(/<w:r\b[\s\S]*?<\/w:r>/g)].map((r) => r[0]).filter((r) => /<w:t[\s>]/.test(r));
    return runs.length > 0 && runs.every((r) => /<w:b\s*\/>|<w:b w:val="(1|true)"/.test(r));
  })();
  const sizes = [...runProps.matchAll(/<w:sz w:val="(\d+)"/g)].map((s) => Number(s[1]) / 2);
  const hasBorder = /<w:pBdr>/.test(pPr);
  return { isBullet, styleId, allBold, sizes, hasBorder };
}

// ------------------------------------------------------------------
// Structure scan: what will confuse a parser
// ------------------------------------------------------------------

function scanStructure(entries, documentXml) {
  const has = (re) => re.test(documentXml);
  const count = (re) => (documentXml.match(re) || []).length;

  const headerFooterText = [];
  for (const [name, entry] of entries) {
    if (/^word\/(header|footer)\d*\.xml$/.test(name)) {
      const xml = inflateEntry(entry);
      const txt = [...xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((m) => decodeEntities(m[1])).join(" ").trim();
      if (txt) headerFooterText.push({ part: name, text: txt });
    }
  }

  const fonts = new Set();
  for (const m of documentXml.matchAll(/<w:rFonts [^>]*w:ascii="([^"]+)"/g)) fonts.add(m[1]);
  if (entries.has("word/styles.xml")) {
    const styles = inflateEntry(entries.get("word/styles.xml"));
    for (const m of styles.matchAll(/<w:rFonts [^>]*w:ascii="([^"]+)"/g)) fonts.add(m[1]);
  }

  const sectPr = (documentXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/g) || []).pop() || "";
  const pgSz = sectPr.match(/<w:pgSz [^>]*w:w="(\d+)"[^>]*w:h="(\d+)"/);
  const pgMar = sectPr.match(/<w:pgMar [^>]*w:top="(\d+)"[^>]*w:right="(\d+)"[^>]*w:bottom="(\d+)"[^>]*w:left="(\d+)"/);
  const cols = sectPr.match(/<w:cols [^>]*w:num="(\d+)"/);

  // White (or near-white) text with no dark shading behind it reads as hidden keyword stuffing.
  let whiteText = 0;
  for (const m of documentXml.matchAll(/<w:rPr>([\s\S]*?)<\/w:rPr>/g)) {
    const rPr = m[1];
    const color = (rPr.match(/<w:color w:val="([0-9A-Fa-f]{6})"/) || [])[1];
    const fill = (rPr.match(/<w:shd [^>]*w:fill="([0-9A-Fa-f]{6})"/) || [])[1];
    if (color && /^F[EF]F[EF]F[EF]$/i.test(color) && !(fill && !/^F[EF]F[EF]F[EF]$/i.test(fill))) whiteText++;
  }
  const tinyText = [...documentXml.matchAll(/<w:sz w:val="(\d+)"/g)].filter((m) => Number(m[1]) < 14).length; // < 7pt

  return {
    tables: count(/<w:tbl>/g),
    textBoxes: count(/<w:txbxContent>|<v:textbox/g),
    images: count(/<w:drawing>|<w:pict>/g),
    headerFooterText,
    columns: cols ? Number(cols[1]) : 1,
    hiddenText: count(/<w:vanish\s*\/>/g),
    whiteText,
    tinyText,
    fonts: [...fonts],
    pageSize: pgSz ? { widthIn: +(Number(pgSz[1]) / 1440).toFixed(2), heightIn: +(Number(pgSz[2]) / 1440).toFixed(2) } : null,
    marginsIn: pgMar ? { top: +(Number(pgMar[1]) / 1440).toFixed(2), right: +(Number(pgMar[2]) / 1440).toFixed(2), bottom: +(Number(pgMar[3]) / 1440).toFixed(2), left: +(Number(pgMar[4]) / 1440).toFixed(2) } : null,
    sectionBreaks: Math.max(0, count(/<w:sectPr/g) - 1),
    symbolGlyphs: count(/<w:sym\s/g),
    hasFootnotes: has(/<w:footnoteReference/),
  };
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

function readDocx(path) {
  const buf = fs.readFileSync(path);
  const entries = readZipEntries(buf);
  if (!entries.has("word/document.xml")) throw new Error("no word/document.xml: not a DOCX");
  const documentXml = inflateEntry(entries.get("word/document.xml"));

  // Body only; table cells contain <w:p> too, so they are captured in order.
  const body = (documentXml.match(/<w:body>([\s\S]*)<\/w:body>/) || [, documentXml])[1];
  const paragraphs = [];
  for (const m of body.matchAll(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>|<w:p\b[^>]*\/>/g)) {
    const pXml = m[1] || "";
    const text = paragraphText(pXml).replace(/[ \t]+$/g, "");
    paragraphs.push({ text, ...paragraphMeta(pXml) });
  }

  const text = paragraphs.map((p) => (p.isBullet ? "• " + p.text : p.text)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { text, paragraphs, structure: scanStructure(entries, documentXml) };
}

function readAny(path) {
  if (/\.docx$/i.test(path)) return readDocx(path);
  const text = fs.readFileSync(path, "utf8");
  const paragraphs = text.split(/\r?\n/).map((line) => ({
    text: line.replace(/^\s*[-*•]\s+/, ""),
    isBullet: /^\s*[-*•]\s+/.test(line),
    styleId: "", allBold: false, sizes: [], hasBorder: false,
  }));
  return { text, paragraphs, structure: null };
}

module.exports = { readDocx, readAny };

if (require.main === module) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) {
    console.error("usage: node docx-text.js <file.docx> [--json]");
    process.exit(2);
  }
  const result = readAny(file);
  if (args.includes("--json")) process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  else process.stdout.write(result.text + "\n");
}
