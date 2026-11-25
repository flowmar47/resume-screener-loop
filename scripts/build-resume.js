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
 *                        [--profile federal] [--paper a4] [--ledger ledger.md]
 *                        [--blind out.txt] [--strict] [--no-render] [--preview] [--help]
 *
 * Runs from the working directory that holds content.js and build_*.js
 * (with `docx` installed locally there). Exit code 1 if any check fails.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const { renderPdf } = require("./render-pdf");

const CHECKER = path.join(__dirname, "resume-check.js");
const PASSTHROUGH = new Set(["--jd", "--must", "--target-pages", "--profile", "--paper", "--ledger", "--blind"]);
const FLAGS = new Set(["--strict", "--no-render"]);

const USAGE = [
  "usage: node build-resume.js [build_role.js ...] [options]",
  "",
  "options:",
  "  --jd <file>              pass job description to resume-check.js",
  "  --must \"a,b\"             pass hard-requirement terms to resume-check.js",
  "  --target-pages <n>       pass page budget to resume-check.js",
  "  --profile <name>         standard | federal",
  "  --paper <letter|a4|any>  expected paper size",
  "  --ledger <path>          pass evidence ledger to resume-check.js",
  "  --blind <out.txt>        write a blinded plain-text copy",
  "  --strict                 MAJOR findings also fail the run",
  "  --no-render              skip LibreOffice page count",
  "  --preview                render PDF once and write page-1 PNG preview",
  "  --help, -h               show this help",
].join("\n");

function parseArgs(argv) {
  const opts = { scripts: [], checkerArgs: [], preview: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      console.log(USAGE);
      process.exit(0);
    } else if (PASSTHROUGH.has(a)) {
      if (i + 1 >= argv.length || argv[i + 1].startsWith("--")) {
        console.error(`missing value for ${a}`);
        process.exit(2);
      }
      opts.checkerArgs.push(a, argv[++i]);
    } else if (FLAGS.has(a)) {
      opts.checkerArgs.push(a);
    } else if (a === "--preview") {
      opts.preview = true;
    } else if (a.startsWith("-")) {
      console.error(`unknown option ${a}`);
      process.exit(2);
    } else {
      opts.scripts.push(a);
    }
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

function runBuild(script) {
  const out = execFileSync(process.execPath, [script], { encoding: "utf8", cwd: process.cwd() });
  process.stdout.write(out);
  const m = out.match(/Wrote:\s*(.+\.docx)\s*$/m);
  if (!m) throw new Error(`${script} did not print "Wrote: <file>.docx"; is it using templates/lib.js writeDoc()?`);
  return path.resolve(process.cwd(), m[1].trim());
}

function runCheck(docx, checkerArgs) {
  const txt = docx.replace(/\.docx$/i, ".txt");
  const res = spawnSync(process.execPath, [CHECKER, docx, ...checkerArgs, "--text", txt], { stdio: "inherit" });
  return res.status === 0;
}

function renderPreview(docx, preRendered) {
  const outDir = path.dirname(docx);
  const r = preRendered || renderPdf(docx, outDir, 15000);
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

  let preRendered = null;
  let extraCheckerArgs = [];
  if (opts.preview && !opts.checkerArgs.includes("--no-render")) {
    preRendered = renderPdf(docx, path.dirname(docx), 15000);
    if (preRendered.pdf) extraCheckerArgs = ["--pdf", preRendered.pdf];
    else extraCheckerArgs = ["--no-render"];
  }

  if (!runCheck(docx, [...opts.checkerArgs, ...extraCheckerArgs])) failed = true;
  if (opts.preview) {
    try { renderPreview(docx, preRendered); } catch (e) { console.error(`preview failed: ${e.message}`); }
  }
}
process.exitCode = failed ? 1 : 0; // not process.exit(): piped stdout is async on macOS and would truncate
