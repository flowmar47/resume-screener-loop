#!/usr/bin/env node

/**
 * check-keywords.js
 *
 * Lightweight ATS must-have checker for resume source files.
 * Compares JD phrases against content.js / build_*.js text.
 *
 * Usage:
 *   node scripts/check-keywords.js --jd path/to/jd.txt --content content.js
 *   node scripts/check-keywords.js --jd jd.txt --content content.js --phrases "AWS Lambda,CI/CD,Kubernetes"
 *
 * Exit code 0 if all phrases found; 1 if any miss.
 */

const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function parseArgs(argv) {
  const opts = { jd: null, content: null, phrases: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--jd" && argv[i + 1]) opts.jd = argv[++i];
    else if (argv[i] === "--content" && argv[i + 1]) opts.content = argv[++i];
    else if (argv[i] === "--phrases" && argv[i + 1]) {
      opts.phrases = argv[++i].split(",").map((p) => p.trim()).filter(Boolean);
    }
  }
  return opts;
}

function extractMustHavePhrases(jdText) {
  const lines = jdText.split("\n");
  const phrases = new Set();

  const bulletLike = /^[\s•\-\*]*(.+)$/;
  const qualificationHeaders = /(required|must have|qualifications|minimum|you have|you'll bring)/i;

  let inQualSection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (qualificationHeaders.test(trimmed) && trimmed.length < 80) {
      inQualSection = true;
      continue;
    }
    if (/^(responsibilities|about the role|what you'll do|preferred|nice to have)/i.test(trimmed)) {
      inQualSection = false;
    }

    if (inQualSection && trimmed.length > 8 && trimmed.length < 120) {
      const m = trimmed.match(bulletLike);
      const text = (m ? m[1] : trimmed).replace(/\.$/, "");
      if (text.split(" ").length <= 12) phrases.add(text);
    }

    const techPatterns = [
      /\b(AWS Lambda|Kubernetes|CI\/CD|Python|TypeScript|Go\b|Rust\b|Docker|Terraform)\b/gi,
      /\b(\d+\+?\s*years?)\b/gi,
    ];
    for (const re of techPatterns) {
      let match;
      while ((match = re.exec(trimmed)) !== null) {
        phrases.add(match[1]);
      }
    }
  }

  return [...phrases].slice(0, 25);
}

function readSources(contentPath) {
  const dir = path.dirname(path.resolve(contentPath));
  const base = path.basename(contentPath);
  let combined = "";

  if (fs.existsSync(contentPath)) {
    combined += fs.readFileSync(contentPath, "utf8") + "\n";
  }

  const buildFiles = fs.readdirSync(dir).filter((f) => f.startsWith("build_") && f.endsWith(".js"));
  for (const f of buildFiles) {
    combined += fs.readFileSync(path.join(dir, f), "utf8") + "\n";
  }

  if (!combined.trim()) {
    log(`No readable content at ${contentPath}`, colors.red);
    process.exit(2);
  }
  return combined;
}

function checkPhrases(phrases, haystack) {
  const lowerHay = haystack.toLowerCase();
  const results = [];

  for (const phrase of phrases) {
    const found = lowerHay.includes(phrase.toLowerCase());
    results.push({ phrase, found });
  }
  return results;
}

const opts = parseArgs(process.argv.slice(2));

if (!opts.content) {
  log("Usage: node scripts/check-keywords.js --jd <file> --content <file> [--phrases \"a,b,c\"]", colors.cyan);
  process.exit(2);
}

let phrases = opts.phrases;
if (!phrases && opts.jd) {
  if (!fs.existsSync(opts.jd)) {
    log(`JD file not found: ${opts.jd}`, colors.red);
    process.exit(2);
  }
  const jdText = fs.readFileSync(opts.jd, "utf8");
  phrases = extractMustHavePhrases(jdText);
  log(`Extracted ${phrases.length} candidate phrases from JD (heuristic).`, colors.cyan);
  log("For precision, pass --phrases with must-haves from your gap scorecard.\n", colors.cyan);
}

if (!phrases || phrases.length === 0) {
  log("No phrases to check. Provide --jd or --phrases.", colors.red);
  process.exit(2);
}

const haystack = readSources(path.resolve(opts.content));
const results = checkPhrases(phrases, haystack);

let misses = 0;
log("Keyword coverage:\n", colors.cyan);
for (const { phrase, found } of results) {
  if (found) {
    log(`  ✓ ${phrase}`, colors.green);
  } else {
    log(`  ✗ ${phrase}`, colors.yellow);
    misses++;
  }
}

const hitRate = Math.round(((results.length - misses) / results.length) * 100);
log(`\nCoverage: ${results.length - misses}/${results.length} (${hitRate}%)`, misses ? colors.yellow : colors.green);

if (misses > 0) {
  log("\nPatch closest bullets to include missing JD phrases (see reference/ats-optimization.md).", colors.cyan);
  process.exit(1);
}

process.exit(0);
