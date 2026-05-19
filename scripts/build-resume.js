#!/usr/bin/env node

/**
 * build-resume.js
 *
 * Automated compiler and anti-pattern linter for the Resume Screener Loop.
 *
 * This script:
 *   1. Performs static analysis on content.js and build_*.js for em-dashes, double-hyphens,
 *      and banned marketing buzzwords / AI clichés.
 *   2. Executes the build script(s) to compile the DOCX resume.
 *   3. Converts the DOCX to PDF using headless LibreOffice.
 *   4. Inspects the PDF using pdfinfo to verify the 1-2 page hard rule constraint.
 *   5. Renders a PNG preview of the first page using pdftoppm.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// ============================================================
// Banned Words and Regex Definitions
// ============================================================
const BANNED_PATTERNS = [
  { term: "em dash (—)", regex: /—/g },
  { term: "double hyphen (--)", regex: /--/g },
  
  // Superlatives without evidence
  { term: "world-class", regex: /\bworld[- ]class\b/i },
  { term: "best-in-class", regex: /\bbest[- ]in[- ]class\b/i },
  { term: "cutting-edge", regex: /\bcutting[- ]edge\b/i },
  { term: "unparalleled", regex: /\bunparalleled\b/i },
  { term: "groundbreaking", regex: /\bgroundbreaking\b/i },
  { term: "industry-leading", regex: /\bindustry[- ]leading\b/i },
  { term: "state-of-the-art", regex: /\bstate[- ]of[- ]the[- ]art\b/i },

  // Empty intensifiers
  { term: "passionate about", regex: /\bpassionate\s+about\b/i },
  { term: "thrilled to", regex: /\bthrilled\s+to\b/i },
  { term: "incredibly excited", regex: /\bincredibly\s+excited\b/i },
  { term: "deeply committed", regex: /\bdeeply\s+committed\b/i },
  { term: "highly motivated", regex: /\bhighly\s+motivated\b/i },

  // Vague impact claims
  { term: "transformed", regex: /\btransformed\b/i },
  { term: "revolutionized", regex: /\brevolutionized\b/i },
  { term: "drove massive impact", regex: /\bdrove\s+massive\s+impact\b/i },
  { term: "game-changing", regex: /\bgame[- ]changing\b/i },
  { term: "next-generation", regex: /\bnext[- ]generation\b/i },

  // Self-awarded titles
  { term: "AI expert", regex: /\bAI\s+expert\b/i },
  { term: "ML enthusiast", regex: /\bML\s+enthusiast\b/i },
  { term: "thought leader", regex: /\bthought\s+leader\b/i },
  { term: "visionary", regex: /\bvisionary\b/i },
  { term: "guru", regex: /\bguru\b/i },
  { term: "ninja", regex: /\bninja\b/i },
  { term: "rockstar", regex: /\brockstar\b/i },
  { term: "wizard", regex: /\bwizard\b/i },

  // 2026 AI-generated clichés to avoid
  { term: "leveraged", regex: /\bleveraged\b/i },
  { term: "delved", regex: /\bdelved\b/i },
  { term: "tapestry", regex: /\btapestry\b/i },
  { term: "beacon of", regex: /\bbeacon\s+of\b/i },
  { term: "testament to", regex: /\btestament\s+to\b/i },
  { term: "fostered", regex: /\bfostered\b/i },
  { term: "pioneered", regex: /\bpioneered\b/i }
];

// Color logging helpers
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m"
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

// ============================================================
// Linter Logic
// ============================================================
function lintFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { passed: true, issues: 0 };
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  let issues = 0;

  log(`\nAnalyzing ${path.basename(filePath)} for anti-patterns...`, colors.cyan);

  lines.forEach((line, index) => {
    // Skip comments in source files
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      return;
    }

    BANNED_PATTERNS.forEach(({ term, regex }) => {
      if (regex.test(line)) {
        log(`  [WARNING] Line ${index + 1}: Found banned ${term}`, colors.yellow);
        log(`    > "${trimmed}"`, colors.reset);
        issues++;
      }
    });
  });

  if (issues === 0) {
    log(`  ✓ No anti-patterns found in ${path.basename(filePath)}.`, colors.green);
    return { passed: true, issues: 0 };
  } else {
    log(`  ⚠ Found ${issues} potential anti-pattern issue(s) in ${path.basename(filePath)}.`, colors.yellow);
    return { passed: false, issues };
  }
}

// ============================================================
// Main Execution
// ============================================================
const args = process.argv.slice(2);
const lintOnly = args.includes("--lint-only");
const specificScript = args.find(arg => arg.endsWith(".js") && !arg.startsWith("-"));

const workingDir = process.cwd();

// Find target scripts
let targetScripts = [];
if (specificScript) {
  const fullPath = path.resolve(workingDir, specificScript);
  if (fs.existsSync(fullPath)) {
    targetScripts.push(specificScript);
  } else {
    log(`Error: Specified build script "${specificScript}" not found.`, colors.red);
    process.exit(1);
  }
} else {
  // Scan for build_*.js
  const files = fs.readdirSync(workingDir);
  targetScripts = files.filter(f => f.startsWith("build_") && f.endsWith(".js"));
}

// Check for content.js and target scripts
const contentPath = path.join(workingDir, "content.js");
const hasContent = fs.existsSync(contentPath);

if (!hasContent && targetScripts.length === 0) {
  log("No files to build or lint in the current working directory.", colors.yellow);
  log("Make sure you are running this command in a directory with content.js and build_*.js scripts.", colors.yellow);
  process.exit(0);
}

// Phase 1: Linting
let totalIssues = 0;
if (hasContent) {
  const result = lintFile(contentPath);
  totalIssues += result.issues;
}

targetScripts.forEach(script => {
  const result = lintFile(path.join(workingDir, script));
  totalIssues += result.issues;
});

if (lintOnly) {
  log(`\nLinting completed. Total issues: ${totalIssues}`, totalIssues > 0 ? colors.yellow : colors.green);
  process.exit(totalIssues > 0 ? 1 : 0);
}

// Phase 2: Building and PDF verification
if (targetScripts.length === 0) {
  log("\nNo build_*.js scripts found in the current directory. Skipped compilation.", colors.yellow);
  process.exit(0);
}

log("\n============================================================", colors.cyan);
log("Compiling Resumes & Verifying Page Constraints", colors.cyan + colors.bold);
log("============================================================\n", colors.cyan);

targetScripts.forEach(script => {
  log(`Running ${script}...`, colors.blue);
  try {
    // 1. Run the build script
    // Ensure Node global packages are accessible
    const env = { ...process.env };
    if (!env.NODE_PATH) {
      try {
        const npmRoot = execSync("npm root -g", { encoding: "utf8" }).trim();
        env.NODE_PATH = npmRoot;
      } catch (e) {
        // Fallback
      }
    }

    const stdout = execSync(`node ${script}`, { env, encoding: "utf8" });
    console.log(stdout.trim());

    // Find the generated .docx file in the current directory or output path
    // The script usually outputs: "Wrote: <path>"
    const wroteMatch = stdout.match(/Wrote:\s*([^\s\n]+)/);
    let docxPath = "";
    if (wroteMatch && wroteMatch[1]) {
      docxPath = wroteMatch[1];
    } else {
      // Fallback: search directory for most recently modified .docx
      const files = fs.readdirSync(workingDir);
      const docxFiles = files.filter(f => f.endsWith(".docx")).map(f => ({
        name: f,
        time: fs.statSync(path.join(workingDir, f)).mtime.getTime()
      }));
      docxFiles.sort((a, b) => b.time - a.time);
      if (docxFiles.length > 0) {
        docxPath = path.join(workingDir, docxFiles[0].name);
      }
    }

    if (!docxPath || !fs.existsSync(docxPath)) {
      log(`Error: Could not locate the generated DOCX file for ${script}.`, colors.red);
      return;
    }

    const docxBasename = path.basename(docxPath);
    log(`  ✓ DOCX successfully generated: ${docxBasename}`, colors.green);

    // 2. Convert to PDF using headless LibreOffice
    const docxDir = path.dirname(docxPath);
    log("  Converting to PDF via headless LibreOffice...", colors.blue);
    
    // Command uses --outdir to put PDF next to the DOCX
    execSync(`libreoffice --headless --convert-to pdf --outdir "${docxDir}" "${docxPath}"`);

    const pdfPath = docxPath.replace(/\.docx$/, ".pdf");
    if (!fs.existsSync(pdfPath)) {
      log("  ⚠ PDF conversion failed: Output PDF not found.", colors.yellow);
      return;
    }

    const pdfBasename = path.basename(pdfPath);
    log(`  ✓ PDF successfully generated: ${pdfBasename}`, colors.green);

    // 3. Check PDF page count with pdfinfo
    try {
      const pdfinfoOut = execSync(`pdfinfo "${pdfPath}"`, { encoding: "utf8" });
      const pagesMatch = pdfinfoOut.match(/Pages:\s+(\d+)/);
      if (pagesMatch && pagesMatch[1]) {
        const pages = parseInt(pagesMatch[1], 10);
        if (pages === 1 || pages === 2) {
          log(`  ✓ Page constraint check passed: ${pages} page(s).`, colors.green);
        } else {
          log(`  ⚠ [PAGE COUNT WARNING] PDF has ${pages} pages! Resumes must target exactly 1–2 pages.`, colors.yellow + colors.bold);
          log("    Action: Shorten summary, compress skill categories, or trim older roles.", colors.reset);
        }
      }
    } catch (e) {
      log("  ⚠ Could not verify page count: pdfinfo command failed or not found.", colors.yellow);
    }

    // 4. Generate visual preview of first page
    try {
      const previewPrefix = path.join(docxDir, `${path.basename(pdfPath, ".pdf")}_preview`);
      execSync(`pdftoppm -png -r 150 -f 1 -l 1 "${pdfPath}" "${previewPrefix}"`);
      // pdftoppm appends -1.png or similar
      const previewFile = `${previewPrefix}-1.png`;
      if (fs.existsSync(previewFile)) {
        log(`  ✓ Page 1 preview thumbnail generated: ${path.basename(previewFile)}`, colors.green);
      }
    } catch (e) {
      // pdftoppm might have a slightly different suffix or fail silently, skip
    }

  } catch (err) {
    log(`Error building resume from ${script}:`, colors.red);
    console.error(err);
  }
});
