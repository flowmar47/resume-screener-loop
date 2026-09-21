#!/usr/bin/env node
/**
 * build-resume.js
 *
 * Build orchestrator: runs every build_*.js in the working directory (or the
 * scripts you name), then runs resume-check.js on each DOCX they write, and
 * optionally renders a page-1 PNG preview when LibreOffice and pdftoppm exist.
 *
 * One source of truth for rules: all linting lives in resume-check.js.
 *
 * usage:
 *   node build-resume.js [build_role.js ...] [--jd jd.txt] [--must "a,b"] [--target-pages n]
 *                        [--profile federal] [--paper a4] [--strict] [--no-render] [--preview]
 *
 * Runs from the working directory that holds content.js and build_*.js
 * (with `docx` installed locally there). Exit code 1 if any check fails.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const { renderPdf } = require("./render-pdf");

const CHECKER = path.join(__dirname, "resume-check.js");
const PASSTHROUGH = new Set(["--jd", "--must", "--target-pages", "--profile", "--paper"]);
const FLAGS = new Set(["--strict", "--no-render"]);

function parseArgs(argv) {
  const opts = { scripts: [], checkerArgs: [], preview: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (PASSTHROUGH.has(a)) { opts.checkerArgs.push(a, argv[++i]); }
    else if (FLAGS.has(a)) opts.checkerArgs.push(a);
    else if (a === "--preview") opts.preview = true;
    else if (a.startsWith("--")) { console.error(`unknown option ${a}`); process.exit(2); }
    else opts.scripts.push(a);
  }
  if (!opts.scripts.length) {
    opts.scripts = fs.readdirSync(process.cwd()).filter((f) => /^build_.*\.js$/.test(f)).sort();
  }
  if (!opts.scripts.length) {
    console.error("no build_*.js scripts here; run from the working directory that holds content.js and build_*.js");
    process.exit(2);
  }
  return opts;
}

function which(cmd) {
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    const p = path.join(dir, cmd);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function runBuild(script) {
  const out = execFileSync(process.execPath, [script], { encoding: "utf8", cwd: process.cwd() });
  process.stdout.write(out);
  const m = out.match(/Wrote:\s*(\S+\.docx)/);
  if (!m) throw new Error(`${script} did not print "Wrote: <file>.docx"; is it using templates/lib.js writeDoc()?`);
  return path.resolve(process.cwd(), m[1]);
}

function runCheck(docx, checkerArgs) {
  const txt = docx.replace(/\.docx$/i, ".txt");
  const res = spawnSync(process.execPath, [CHECKER, docx, ...checkerArgs, "--text", txt], { stdio: "inherit" });
  return res.status === 0;
}

function renderPreview(docx) {
  const outDir = path.dirname(docx);
  const r = renderPdf(docx, outDir, 15000);
  if (r.error) { console.log(`preview: ${r.error}; skipped`); return; }
  console.log(`preview: wrote ${r.pdf}`);
  const pdftoppm = which("pdftoppm");
  if (!pdftoppm) { console.log("preview: pdftoppm not found; PNG skipped"); return; }
  const prefix = r.pdf.replace(/\.pdf$/i, "_page1");
  execFileSync(pdftoppm, ["-png", "-r", "130", "-f", "1", "-l", "1", r.pdf, prefix], { stdio: "ignore" });
  console.log(`preview: wrote ${prefix}-1.png`);
}

const opts = parseArgs(process.argv.slice(2));
let failed = false;
for (const script of opts.scripts) {
  console.log(`\n=== ${script} ===`);
  let docx;
  try { docx = runBuild(script); } catch (e) { console.error(`build failed: ${e.message}`); failed = true; continue; }
  if (!runCheck(docx, opts.checkerArgs)) failed = true;
  if (opts.preview) {
    try { renderPreview(docx); } catch (e) { console.error(`preview failed: ${e.message}`); }
  }
}
process.exitCode = failed ? 1 : 0; // not process.exit(): piped stdout is async on macOS and would truncate
