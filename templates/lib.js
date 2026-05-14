/**
 * lib.js
 *
 * Reusable docx-js helpers for ATS-friendly resume generation.
 *
 * Defaults:
 *   - Calibri 10pt body, 11pt section headers, 22pt name
 *   - 0.75" margins, US Letter
 *   - Single accent color for section headers (default: muted blue)
 *   - No tables for layout (ATS-safe)
 *   - No headers/footers (ATS-safe)
 *   - Bullet lists use built-in numbering
 *
 * Override the defaults at the top of this file or by passing options to buildDoc().
 */

const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink,
  AlignmentType, HeadingLevel, BorderStyle, TabStopType, TabStopPosition,
  LevelFormat, Indent,
} = require("docx");
const fs = require("fs");

// ============================================================
// Defaults, override as needed
// ============================================================

const FONT = "Calibri";
const ACCENT = "1B4F72"; // muted blue
const BODY_SIZE = 20;    // half-points: 10pt
const SECTION_SIZE = 22; // 11pt
const NAME_SIZE = 44;    // 22pt
const PAGE_MARGIN_TWIPS = 1080; // 0.75 inch

// ============================================================
// Headline + contact
// ============================================================

function name(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: NAME_SIZE,
        font: FONT,
      }),
    ],
  });
}

function contact(parts) {
  // parts is an array of strings or {link, text} objects
  const runs = parts.map((p) => {
    if (typeof p === "string") {
      return new TextRun({ text: p, size: BODY_SIZE, font: FONT });
    }
    return new ExternalHyperlink({
      link: p.link,
      children: [
        new TextRun({
          text: p.text,
          size: BODY_SIZE,
          font: FONT,
          color: ACCENT,
        }),
      ],
    });
  });

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: runs,
  });
}

// ============================================================
// Section header with bottom border
// ============================================================

function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: {
      bottom: {
        color: ACCENT,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: SECTION_SIZE,
        font: FONT,
        color: ACCENT,
      }),
    ],
  });
}

// ============================================================
// Summary paragraph
// ============================================================

function summary(text) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    children: [
      new TextRun({ text, size: BODY_SIZE, font: FONT }),
    ],
  });
}

// ============================================================
// Role header, title | org (left), dates (right via tab)
// ============================================================

function roleHeader({ title, org, dates }) {
  return new Paragraph({
    spacing: { before: 140, after: 20 },
    tabStops: [
      { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
    ],
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: BODY_SIZE,
        font: FONT,
      }),
      new TextRun({
        text: `  |  ${org}`,
        italics: true,
        size: BODY_SIZE,
        font: FONT,
      }),
      new TextRun({
        text: `\t${dates}`,
        size: BODY_SIZE,
        font: FONT,
      }),
    ],
  });
}

// ============================================================
// Optional italic note under a role header
// ============================================================

function roleNote(text) {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({
        text,
        italics: true,
        size: BODY_SIZE,
        font: FONT,
      }),
    ],
  });
}

// ============================================================
// Bullet
// ============================================================

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullet-list", level: 0 },
    spacing: { after: 60, line: 264 },
    children: [
      new TextRun({ text, size: BODY_SIZE, font: FONT }),
    ],
  });
}

// ============================================================
// Skill line, bold category, then content
// ============================================================

function skillLine(category, content) {
  return new Paragraph({
    spacing: { after: 60, line: 264 },
    indent: { left: 0 },
    children: [
      new TextRun({
        text: `${category}:  `,
        bold: true,
        size: BODY_SIZE,
        font: FONT,
      }),
      new TextRun({
        text: content,
        size: BODY_SIZE,
        font: FONT,
      }),
    ],
  });
}

// ============================================================
// Education line
// ============================================================

function eduLine({ school, degree, detail }) {
  const children = [
    new TextRun({
      text: school,
      bold: true,
      size: BODY_SIZE,
      font: FONT,
    }),
    new TextRun({
      text: `  |  ${degree}`,
      size: BODY_SIZE,
      font: FONT,
    }),
  ];
  if (detail) {
    children.push(
      new TextRun({
        text: `  |  ${detail}`,
        italics: true,
        size: BODY_SIZE,
        font: FONT,
      })
    );
  }
  return new Paragraph({
    spacing: { after: 60 },
    children,
  });
}

// ============================================================
// Build document
// ============================================================

function buildDoc(children) {
  return new Document({
    creator: "resume-screener-loop",
    styles: {
      default: {
        document: {
          run: { font: FONT, size: BODY_SIZE },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "bullet-list",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 360, hanging: 240 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: PAGE_MARGIN_TWIPS,
              right: PAGE_MARGIN_TWIPS,
              bottom: PAGE_MARGIN_TWIPS,
              left: PAGE_MARGIN_TWIPS,
            },
          },
        },
        children,
      },
    ],
  });
}

async function writeDoc(doc, outputPath) {
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Wrote: ${outputPath}`);
}

module.exports = {
  name,
  contact,
  sectionHeader,
  summary,
  roleHeader,
  roleNote,
  bullet,
  skillLine,
  eduLine,
  buildDoc,
  writeDoc,
};
