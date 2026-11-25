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
 *   const { readDocx, readAny } = require("./docx-text");
 *   const { text, paragraphs, structure } = readDocx("resume.docx");
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { execFileSync } = require("child_process");

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
// XML helpers (regex + balanced tag scan for nested <w:p>)
// ------------------------------------------------------------------

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
}

function extractTopLevelParagraphs(xml) {
  const results = [];
  const tagRe = /<\/?w:p(?=[\s/>])/g;
  let pos = 0;

  while (pos < xml.length) {
    tagRe.lastIndex = pos;
    let open;
    while ((open = tagRe.exec(xml)) !== null) {
      if (!open[0].startsWith("</")) break;
    }
    if (!open) break;

    const gt = xml.indexOf(">", open.index);
    if (gt < 0) break;
    if (xml[gt - 1] === "/") {
      results.push("");
      pos = gt + 1;
      continue;
    }

    const contentStart = gt + 1;
    let depth = 1;
    tagRe.lastIndex = contentStart;
    let m;
    let endIdx = -1;
    let nextPos = contentStart;

    while ((m = tagRe.exec(xml)) !== null) {
      const tagGt = xml.indexOf(">", m.index);
      if (tagGt < 0) break;
      if (m[0].startsWith("</")) {
        depth--;
        if (depth === 0) {
          endIdx = m.index;
          nextPos = tagGt + 1;
          break;
        }
      } else if (xml[tagGt - 1] !== "/") {
        depth++;
      }
      tagRe.lastIndex = tagGt + 1;
    }

    if (endIdx < 0) {
      results.push(xml.slice(contentStart));
      break;
    }
    results.push(xml.slice(contentStart, endIdx));
    pos = nextPos;
  }

  return results;
}

function splitTextBoxes(pXml) {
  const boxes = [];
  let stripped = pXml.replace(/<w:txbxContent\b[^>]*>([\s\S]*?)<\/w:txbxContent>/g, (_, inner) => {
    boxes.push(inner);
    return "";
  });
  stripped = stripped.replace(/<v:textbox\b[^>]*>([\s\S]*?)<\/v:textbox>/g, (_, inner) => {
    // Only extract fallback v:textbox paragraphs if no w:txbxContent existed in this paragraph
    if (boxes.length === 0) boxes.push(inner);
    return "";
  });
  return { parentXml: stripped, boxes };
}

function paragraphText(pXml) {
  // Walk runs in order: text, tabs, line breaks. Skip deleted text (<w:delText>).
  let out = "";
  const tokenRe = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>|<w:cr\b[^>]*\/>|<w:noBreakHyphen\b[^>]*\/>|<w:sym\b[^>]*\/>/g;
  let m;
  while ((m = tokenRe.exec(pXml)) !== null) {
    if (m[0].startsWith("<w:t")) out += decodeEntities(m[1]);
    else if (m[0].startsWith("<w:tab")) out += "\t";
    else if (m[0].startsWith("<w:br") || m[0].startsWith("<w:cr")) out += "\n";
    else if (m[0].startsWith("<w:noBreakHyphen")) out += "-";
    else out += "\uFFFD"; // symbol glyph: a parser sees garbage here
  }
  return out;
}

function paragraphMeta(pXml) {
  const pPr = (pXml.match(/<w:pPr\b[^>]*>([\s\S]*?)<\/w:pPr>/) || [, ""])[1];
  const isBullet = /<w:numPr\b/.test(pPr);
  const styleId = (pPr.match(/<w:pStyle\b[^>]*\bw:val="([^"]+)"/) || [, ""])[1];
  const runProps = [...pXml.matchAll(/<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/g)].map((r) => r[1]).join(" ");
  const allBold = (() => {
    const runs = [...pXml.matchAll(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g)]
      .map((r) => r[0])
      .filter((r) => /<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>/.test(r));
    return runs.length > 0 && runs.every((r) => /<w:b(?:\s*\/>|\s+[^>]*\bw:val="(?:1|true)"[^>]*\/?>)/.test(r));
  })();
  const sizes = [...runProps.matchAll(/<w:sz\b[^>]*\bw:val="(\d+)"/g)].map((s) => Number(s[1]) / 2);
  const hasBorder = /<w:pBdr\b/.test(pPr);
  return { isBullet, styleId, allBold, sizes, hasBorder };
}

function collectParagraphs(xml, out) {
  for (const rawP of extractTopLevelParagraphs(xml)) {
    const { parentXml, boxes } = splitTextBoxes(rawP);
    const text = paragraphText(parentXml).replace(/[ \t]+$/g, "");
    if (text.trim() || boxes.length === 0) {
      out.push({ text, ...paragraphMeta(parentXml) });
    }
    for (const boxXml of boxes) {
      collectParagraphs(boxXml, out);
    }
  }
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
  for (const m of documentXml.matchAll(/<w:rFonts\b[^>]*\bw:ascii="([^"]+)"/g)) fonts.add(m[1]);
  if (entries.has("word/styles.xml")) {
    const styles = inflateEntry(entries.get("word/styles.xml"));
    for (const m of styles.matchAll(/<w:rFonts\b[^>]*\bw:ascii="([^"]+)"/g)) fonts.add(m[1]);
  }

  const sectPr = (documentXml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/g) || []).pop() || "";

  const pgSzTag = (sectPr.match(/<w:pgSz\b([^>]*)>/) || [])[1] || "";
  const pgW = pgSzTag.match(/\bw:w="(\d+)"/);
  const pgH = pgSzTag.match(/\bw:h="(\d+)"/);

  const pgMarTag = (sectPr.match(/<w:pgMar\b([^>]*)>/) || [])[1] || "";
  const marTop = pgMarTag.match(/\bw:top="(\d+)"/);
  const marRight = pgMarTag.match(/\bw:right="(\d+)"/);
  const marBottom = pgMarTag.match(/\bw:bottom="(\d+)"/);
  const marLeft = pgMarTag.match(/\bw:left="(\d+)"/);

  const cols = sectPr.match(/<w:cols\b[^>]*\bw:num="(\d+)"/);

  // White (or near-white) text with no dark shading behind it reads as hidden keyword stuffing.
  let whiteText = 0;
  for (const m of documentXml.matchAll(/<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/g)) {
    const rPr = m[1];
    const colorTag = (rPr.match(/<w:color\b([^>]*)>/) || [])[1] || "";
    const color = (colorTag.match(/\bw:val="([0-9A-Fa-f]{6})"/) || [])[1];
    const shdTag = (rPr.match(/<w:shd\b([^>]*)>/) || [])[1] || "";
    const fill = (shdTag.match(/\bw:fill="([0-9A-Fa-f]{6})"/) || [])[1];
    if (color && /^F[EF]F[EF]F[EF]$/i.test(color) && !(fill && !/^F[EF]F[EF]F[EF]$/i.test(fill))) whiteText++;
  }

  // Only inspect <w:sz> inside <w:r> runs that actually contain non-whitespace <w:t> text.
  let tinyText = 0;
  for (const rMatch of documentXml.matchAll(/<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g)) {
    const runXml = rMatch[1];
    const runText = [...runXml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
      .map((t) => decodeEntities(t[1]))
      .join("");
    if (!runText.trim()) continue;
    const szMatch = runXml.match(/<w:sz\b[^>]*\bw:val="(\d+)"/);
    if (szMatch && Number(szMatch[1]) < 14) tinyText++; // < 7pt
  }

  return {
    tables: count(/<w:tbl\b/g),
    textBoxes: count(/<w:txbxContent\b|<v:textbox\b/g),
    images: count(/<w:drawing\b|<w:pict\b/g),
    headerFooterText,
    columns: cols ? Number(cols[1]) : 1,
    hiddenText: count(/<w:vanish\b(?![^>]*w:val="(?:0|false)")[^>]*>|<w:webHidden\b(?![^>]*w:val="(?:0|false)")[^>]*>/g),
    whiteText,
    tinyText,
    fonts: [...fonts],
    pageSize: pgW && pgH ? { widthIn: +(Number(pgW[1]) / 1440).toFixed(2), heightIn: +(Number(pgH[1]) / 1440).toFixed(2) } : null,
    marginsIn: marTop && marRight && marBottom && marLeft ? {
      top: +(Number(marTop[1]) / 1440).toFixed(2),
      right: +(Number(marRight[1]) / 1440).toFixed(2),
      bottom: +(Number(marBottom[1]) / 1440).toFixed(2),
      left: +(Number(marLeft[1]) / 1440).toFixed(2),
    } : null,
    sectionBreaks: Math.max(0, count(/<w:sectPr\b/g) - 1),
    symbolGlyphs: count(/<w:sym\b/g),
    hasFootnotes: has(/<w:footnoteReference\b/),
  };
}

function which(cmd) {
  const candidates = process.platform === "win32" ? [cmd + ".exe", cmd] : [cmd];
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    if (!dir) continue;
    for (const c of candidates) {
      const p = path.join(dir, c);
      if (fs.existsSync(p) && !fs.statSync(p).isDirectory()) return p;
    }
  }
  return null;
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

function readDocx(filePath) {
  const buf = fs.readFileSync(filePath);
  const entries = readZipEntries(buf);
  if (!entries.has("word/document.xml")) throw new Error("no word/document.xml: not a DOCX");
  const documentXml = inflateEntry(entries.get("word/document.xml"));

  // Body only; table cells contain <w:p> too, so they are captured in order.
  const body = (documentXml.match(/<w:body\b[^>]*>([\s\S]*)<\/w:body>/) || [, documentXml])[1];
  const paragraphs = [];
  collectParagraphs(body, paragraphs);

  const text = paragraphs.map((p) => (p.isBullet ? "• " + p.text : p.text)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { text, paragraphs, structure: scanStructure(entries, documentXml) };
}

function readAny(filePath) {
  if (/\.docx$/i.test(filePath)) return readDocx(filePath);

  if (/\.pdf$/i.test(filePath)) {
    const pdftotext = which("pdftotext");
    if (!pdftotext) {
      throw new Error("PDF input requires pdftotext (poppler) or pass .docx/.md/.txt");
    }
    const rawPdfText = execFileSync(pdftotext, [filePath, "-"], { encoding: "utf8" });
    const paragraphs = rawPdfText.split(/\r?\n/).map((line) => ({
      text: line.replace(/^\s*[-*•]\s+/, ""),
      isBullet: /^\s*[-*•]\s+/.test(line),
      styleId: "", allBold: false, sizes: [], hasBorder: false,
    }));
    const text = paragraphs.map((p) => (p.isBullet ? "• " + p.text : p.text)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
    return { text, paragraphs, structure: null };
  }

  const rawText = fs.readFileSync(filePath, "utf8");
  const paragraphs = rawText.split(/\r?\n/).map((line) => {
    const isBullet = /^\s*[-*•]\s+/.test(line);
    if (isBullet) {
      return {
        text: line.replace(/^\s*[-*•]\s+/, ""),
        isBullet: true,
        styleId: "", allBold: false, sizes: [], hasBorder: false,
      };
    }

    const trimmed = line.trim();
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const cleanHeading = headingMatch[2].trim().replace(/^\*\*((?:(?!\*\*).)+)\*\*$/, "$1");
      return {
        text: cleanHeading,
        isBullet: false,
        styleId: `Heading${level}`,
        allBold: true,
        sizes: [],
        hasBorder: false,
      };
    }

    const boldOnlyMatch = trimmed.match(/^\*\*((?:(?!\*\*).)+)\*\*$/);
    if (boldOnlyMatch) {
      return {
        text: boldOnlyMatch[1].trim(),
        isBullet: false,
        styleId: "",
        allBold: true,
        sizes: [],
        hasBorder: false,
      };
    }

    return {
      text: line,
      isBullet: false,
      styleId: "", allBold: false, sizes: [], hasBorder: false,
    };
  });

  const text = paragraphs.map((p) => (p.isBullet ? "• " + p.text : p.text)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { text, paragraphs, structure: null };
}

module.exports = { readDocx, readAny };

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("usage: node docx-text.js <file.docx|.md|.txt|.pdf> [--json]");
    process.exit(0);
  }
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) {
    console.error("usage: node docx-text.js <file.docx|.md|.txt|.pdf> [--json]");
    process.exit(2);
  }
  const result = readAny(file);
  if (args.includes("--json")) process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  else process.stdout.write(result.text + "\n");
}
