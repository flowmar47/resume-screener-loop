"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const zlib = require("node:zlib");

const { readDocx, readAny } = require("../scripts/docx-text");

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildMinimalZip(entriesObj) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const [name, content] of Object.entries(entriesObj)) {
    const nameBuf = Buffer.from(name, "utf8");
    const rawBuf = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
    const compBuf = zlib.deflateRawSync(rawBuf);
    const crc = crc32(rawBuf);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compBuf.length, 18);
    local.writeUInt32LE(rawBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);

    localParts.push(local, compBuf);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compBuf.length, 20);
    central.writeUInt32LE(rawBuf.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);

    centralParts.push(central);
    offset += local.length + compBuf.length;
  }

  const centralBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  const count = Object.keys(entriesObj).length;
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(count, 8);
  eocd.writeUInt16LE(count, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralBuf, eocd]);
}

function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "docx-text-test-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("readDocx parses reordered pgSz, pgMar, and color attributes", () => {
  withTempDir((dir) => {
    const docxPath = path.join(dir, "reordered.docx");
    const documentXml = `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:r>
              <w:rPr><w:color w:themeColor="background1" w:val="FFFFFF"/></w:rPr>
              <w:t>Hidden white keyword</w:t>
            </w:r>
          </w:p>
          <w:sectPr>
            <w:pgSz w:orient="portrait" w:h="15840" w:w="12240"/>
            <w:pgMar w:gutter="0" w:left="720" w:bottom="1440" w:right="720" w:top="1080"/>
          </w:sectPr>
        </w:body>
      </w:document>`;
    fs.writeFileSync(docxPath, buildMinimalZip({ "word/document.xml": documentXml }));

    const res = readDocx(docxPath);
    assert.deepEqual(res.structure.pageSize, { widthIn: 8.5, heightIn: 11 });
    assert.deepEqual(res.structure.marginsIn, { top: 0.75, right: 0.5, bottom: 1, left: 0.5 });
    assert.equal(res.structure.whiteText, 1);
  });
});

test("readDocx ignores tiny font sizes on empty spacer paragraphs", () => {
  withTempDir((dir) => {
    const docxPath = path.join(dir, "spacers.docx");
    const documentXml = `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:pPr><w:rPr><w:sz w:val="8"/></w:rPr></w:pPr>
            <w:r><w:rPr><w:sz w:val="8"/></w:rPr><w:t>   </w:t></w:r>
          </w:p>
          <w:p>
            <w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>Normal body text</w:t></w:r>
          </w:p>
          <w:p>
            <w:r><w:rPr><w:sz w:val="10"/></w:rPr><w:t>Actual 5pt text</w:t></w:r>
          </w:p>
        </w:body>
      </w:document>`;
    fs.writeFileSync(docxPath, buildMinimalZip({ "word/document.xml": documentXml }));

    const res = readDocx(docxPath);
    assert.equal(res.structure.tinyText, 1);
  });
});

test("readDocx handles nested <w:p> inside <w:txbxContent> without corrupting parent paragraph", () => {
  withTempDir((dir) => {
    const docxPath = path.join(dir, "textbox.docx");
    const documentXml = `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:r><w:b/><w:t>Parent Before </w:t></w:r>
            <w:r><w:drawing><w:txbxContent><w:p><w:r><w:t>Box Text</w:t></w:r></w:p></w:txbxContent></w:drawing></w:r>
            <w:r><w:b/><w:t>Parent After</w:t></w:r>
          </w:p>
          <w:p><w:r><w:t>Following Paragraph</w:t></w:r></w:p>
        </w:body>
      </w:document>`;
    fs.writeFileSync(docxPath, buildMinimalZip({ "word/document.xml": documentXml }));

    const res = readDocx(docxPath);
    assert.equal(res.structure.textBoxes, 1);
    assert.equal(res.paragraphs[0].text, "Parent Before Parent After");
    assert.equal(res.paragraphs[0].allBold, true);
    assert.equal(res.paragraphs[1].text, "Box Text");
    assert.equal(res.paragraphs[2].text, "Following Paragraph");
  });
});

test("readDocx detects <w:tbl attributes>, <w:vanish>, and <w:webHidden> while ignoring w:val=0/false", () => {
  withTempDir((dir) => {
    const docxPath = path.join(dir, "hazards.docx");
    const documentXml = `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:tbl w:id="1"><w:tr><w:tc><w:p><w:r><w:t>Cell</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
          <w:p><w:r><w:rPr><w:vanish/></w:rPr><w:t>v1</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:vanish w:val="true"/></w:rPr><w:t>v2</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:webHidden/></w:rPr><w:t>v3</w:t></w:r></w:p>
          <w:p><w:r><w:rPr><w:vanish w:val="0"/><w:vanish w:val="false"/></w:rPr><w:t>visible</w:t></w:r></w:p>
        </w:body>
      </w:document>`;
    fs.writeFileSync(docxPath, buildMinimalZip({ "word/document.xml": documentXml }));

    const res = readDocx(docxPath);
    assert.equal(res.structure.tables, 1);
    assert.equal(res.structure.hiddenText, 3);
  });
});

test("readAny parses Markdown headings and bold-only lines", () => {
  withTempDir((dir) => {
    const mdPath = path.join(dir, "resume.md");
    fs.writeFileSync(mdPath, [
      "# Avery Lin",
      "Austin, TX | avery@example.com | (555) 555-0100",
      "## Experience",
      "**Senior Engineer | Acme | Jan 2022 - Present**",
      "- Built distributed queue workers in Go",
    ].join("\n"));

    const res = readAny(mdPath);
    assert.equal(res.paragraphs[0].text, "Avery Lin");
    assert.equal(res.paragraphs[0].styleId, "Heading1");
    assert.equal(res.paragraphs[0].allBold, true);
    assert.equal(res.paragraphs[2].text, "Experience");
    assert.equal(res.paragraphs[2].styleId, "Heading2");
    assert.equal(res.paragraphs[2].allBold, true);
    assert.equal(res.paragraphs[3].text, "Senior Engineer | Acme | Jan 2022 - Present");
    assert.equal(res.paragraphs[3].allBold, true);
    assert.equal(res.paragraphs[4].isBullet, true);
    assert.equal(res.paragraphs[4].text, "Built distributed queue workers in Go");
  });
});

test("readAny throws actionable error on .pdf when pdftotext is unavailable", () => {
  withTempDir((dir) => {
    const pdfPath = path.join(dir, "resume.pdf");
    fs.writeFileSync(pdfPath, "%PDF-1.4\n%%EOF\n");
    const prevPath = process.env.PATH;
    process.env.PATH = "";
    try {
      assert.throws(
        () => readAny(pdfPath),
        /PDF input requires pdftotext \(poppler\) or pass \.docx\/\.md\/\.txt/
      );
    } finally {
      process.env.PATH = prevPath;
    }
  });
});
