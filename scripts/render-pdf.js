#!/usr/bin/env node
/**
 * render-pdf.js
 *
 * Convert a DOCX to PDF with LibreOffice when it is installed. Used by
 * resume-check.js (exact page count) and build-resume.js (preview).
 *
 * Runs soffice with an isolated user profile and a hard timeout, because a
 * shared profile hands the job to any running LibreOffice instance and can
 * block indefinitely, and some sandboxes stall it entirely.
 *
 * CLI:    node render-pdf.js resume.docx [outDir]   -> prints the PDF path, or exits 1
 * Module: const { findSoffice, renderPdf, pdfPageCount } = require("./render-pdf");
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const KNOWN_PATHS = [
  "/Applications/LibreOffice.app/Contents/MacOS/soffice",
  "/usr/lib/libreoffice/program/soffice",
  "/opt/libreoffice/program/soffice",
  "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
];

function findSoffice() {
  const names = process.platform === "win32" ? ["soffice.exe", "soffice.com"] : ["soffice", "libreoffice"];
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    for (const n of names) {
      const p = path.join(dir, n);
      if (fs.existsSync(p) && !fs.statSync(p).isDirectory()) return p;
    }
  }
  return KNOWN_PATHS.find((p) => fs.existsSync(p)) || null;
}

/**
 * Returns { pdf } on success, { error } otherwise. Never throws.
 * timeoutMs defaults to 15s; a stall reports "timeout". A normal conversion takes a few seconds.
 */
function renderPdf(docx, outDir, timeoutMs = 15000) {
  const soffice = findSoffice();
  if (!soffice) return { error: "libreoffice not installed" };
  const dir = outDir || fs.mkdtempSync(path.join(os.tmpdir(), "render-pdf-"));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "lo-profile-"));
  const pdf = path.join(dir, path.basename(docx).replace(/\.docx$/i, ".pdf"));
  try {
    execFileSync(soffice, [
      `-env:UserInstallation=file://${profile}`,
      "--headless", "--norestore", "--nologo",
      "--convert-to", "pdf", "--outdir", dir, docx,
    ], { stdio: "ignore", timeout: timeoutMs });
  } catch (e) {
    return { error: e.code === "ETIMEDOUT" || /ETIMEDOUT|TIMEOUT/i.test(String(e.signal || e.message)) ? "timeout" : `soffice failed: ${e.message}` };
  } finally {
    fs.rmSync(profile, { recursive: true, force: true });
  }
  return fs.existsSync(pdf) ? { pdf } : { error: "soffice produced no pdf" };
}

/** Counts pages from the PDF's page objects; no external tools. */
function pdfPageCount(pdfPath) {
  const bytes = fs.readFileSync(pdfPath, "latin1");
  const m = bytes.match(/\/Type\s*\/Pages\b[^>]*\/Count\s+(\d+)/);
  if (m) return Number(m[1]);
  return (bytes.match(/\/Type\s*\/Page\b(?!s)/g) || []).length || null;
}

module.exports = { findSoffice, renderPdf, pdfPageCount };

if (require.main === module) {
  const [docx, outDir] = process.argv.slice(2);
  if (!docx) { console.error("usage: node render-pdf.js <file.docx> [outDir]"); process.exitCode = 2; }
  else {
    const r = renderPdf(docx, outDir || path.dirname(path.resolve(docx)));
    if (r.pdf) console.log(r.pdf);
    else { console.error(`render-pdf: ${r.error}`); process.exitCode = 1; }
  }
}
