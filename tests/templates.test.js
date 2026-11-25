"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Module = require("node:module");

const { pdfPageCount } = require("../scripts/render-pdf");

function loadTemplatesWithStubDocx() {
  const prevLoad = Module._load;
  const stubDocx = {
    AlignmentType: { CENTER: "center", LEFT: "left" },
    BorderStyle: { SINGLE: "single" },
    TabStopType: { RIGHT: "right" },
    TabStopPosition: { MAX: 9026 },
    LevelFormat: { BULLET: "bullet" },
    Document: class Document {
      constructor(opts) { this.opts = opts; }
    },
    Paragraph: class Paragraph {
      constructor(opts) { this.opts = opts; }
    },
    TextRun: class TextRun {
      constructor(opts) { this.opts = opts; }
    },
    ExternalHyperlink: class ExternalHyperlink {
      constructor(opts) { this.opts = opts; }
    },
    Packer: {
      async toBuffer(doc) {
        return Buffer.from(JSON.stringify(doc.opts));
      },
    },
  };

  Module._load = function (request, parent, isMain) {
    if (request === "docx") return stubDocx;
    return prevLoad.apply(this, arguments);
  };

  try {
    delete require.cache[require.resolve("../templates/lib")];
    delete require.cache[require.resolve("../templates/content-template")];
    const lib = require("../templates/lib");
    const content = require("../templates/content-template");
    return { lib, content };
  } finally {
    Module._load = prevLoad;
  }
}

async function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "templates-test-"));
  try {
    return await fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("templates/lib.js buildDoc supports paper, margins, font, accent and dynamic right tab stop", async () => {
  const { lib } = loadTemplatesWithStubDocx();

  // Default US Letter (12240) with 0.75" (1080) margins -> right tab at 10080 (fixes 0.73" gap)
  assert.equal(lib.rightTabPosition(), 10080);
  const rhDefault = lib.roleHeader({ title: "Engineer", org: "Acme", dates: "Jan 2022 – Present" });
  assert.equal(rhDefault.opts.tabStops[0].position, 10080);

  // A4 (11906) with 0.5" (720) margins -> right tab at 10466
  assert.equal(lib.rightTabPosition({ paper: "a4", margins: 720 }), 10466);
  const rhA4 = lib.roleHeader({ title: "Engineer", org: "Acme", dates: "Jan 2022 – Present" }, { paper: "a4", margins: 720 });
  assert.equal(rhA4.opts.tabStops[0].position, 10466);

  const helpers = lib.createHelpers({ paper: "a4", margins: { top: 720, right: 900, bottom: 720, left: 900 }, font: "Georgia", accent: "#2C3E50" });
  const sh = helpers.sectionHeader("Experience");
  assert.equal(sh.opts.border.bottom.color, "2C3E50");
  assert.equal(sh.opts.children[0].opts.font, "Georgia");

  const doc = lib.buildDoc([sh], { paper: "a4", margins: 720, font: "Georgia", accent: "2C3E50" });
  assert.deepEqual(doc.opts.sections[0].properties.page.size, { width: 11906, height: 16838 });
  assert.deepEqual(doc.opts.sections[0].properties.page.margin, { top: 720, right: 720, bottom: 720, left: 720 });
  assert.equal(doc.opts.styles.default.document.run.font, "Georgia");

  // writeDoc creates missing parent directories
  await withTempDir(async (dir) => {
    const outPath = path.join(dir, "nested", "out", "Resume.docx");
    await lib.writeDoc(doc, outPath);
    assert.equal(fs.existsSync(outPath), true);
  });
});

test("templates/content-template.js uses MMM YYYY date format", () => {
  const { content } = loadTemplatesWithStubDocx();
  assert.match(content.ROLE_1_HEADER.dates, /^[A-Z][a-z]{2}\s+\d{4}\s+–\s+Present$/);
  assert.match(content.ROLE_2_HEADER.dates, /^[A-Z][a-z]{2}\s+\d{4}\s+–\s+[A-Z][a-z]{2}\s+\d{4}$/);
});

test("pdfPageCount handles /Count before or after /Type /Pages and takes max /Count", async () => {
  await withTempDir((dir) => {
    const beforePath = path.join(dir, "before.pdf");
    fs.writeFileSync(beforePath, "%PDF-1.4\n2 0 obj << /Count 2 /Kids [3 0 R 4 0 R] /Type /Pages >> endobj\n");
    assert.equal(pdfPageCount(beforePath), 2);

    const multiPath = path.join(dir, "multi.pdf");
    fs.writeFileSync(multiPath, [
      "%PDF-1.4",
      "2 0 obj << /Count 3 /Kids [3 0 R 4 0 R] /Type /Pages >> endobj",
      "3 0 obj << /Type /Pages /Count 1 /Kids [5 0 R] >> endobj",
    ].join("\n"));
    assert.equal(pdfPageCount(multiPath), 3);

    const fallbackPath = path.join(dir, "fallback.pdf");
    fs.writeFileSync(fallbackPath, "%PDF-1.4\n3 0 obj << /Type /Page >> endobj\n4 0 obj << /Type /Page >> endobj\n");
    assert.equal(pdfPageCount(fallbackPath), 2);
  });
});
