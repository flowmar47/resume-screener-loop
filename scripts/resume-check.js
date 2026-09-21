#!/usr/bin/env node
/**
 * resume-check.js
 *
 * Deterministic resume checker. Runs the parts of the screener loop that a
 * script can do better than a model: ATS parse safety, house style rules,
 * structure, dates, page budget, and JD keyword coverage.
 *
 * Zero dependencies (Node >= 18). Uses ./docx-text.js for DOCX input.
 * Optional: LibreOffice (soffice) for an exact page count; otherwise estimated.
 *
 * usage:
 *   node resume-check.js <resume.docx|.txt|.md> [options]
 *
 * options:
 *   --jd <file>           job description text; enables keyword coverage
 *   --must "a,b,c"        terms that must appear (hard requirements); MAJOR if absent
 *   --target-pages <n>    page budget (default 2; use 1 for new grads)
 *   --profile <name>      standard (default) | federal
 *   --paper <letter|a4|any>  expected paper size (default letter)
 *   --text <out.txt>      also write the ATS-extracted plain text
 *   --json                machine-readable report on stdout
 *   --strict              MAJOR findings also fail the run
 *
 * exit codes: 0 pass, 1 blockers (or majors with --strict), 2 usage error
 *
 * This is a diagnostic, not an ATS verdict. No employer system publishes a
 * score; the keyword section lists candidate gaps for a human or agent to judge.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");
const { readAny } = require("./docx-text");

// ------------------------------------------------------------------
// Word lists
// ------------------------------------------------------------------

// Hard-banned phrasing (house rule + recruiter AI-cadence tells). BLOCKER.
const BANNED_PHRASES = [
  "world-class", "world class", "best-in-class", "best in class", "cutting-edge", "cutting edge",
  "unparalleled", "groundbreaking", "industry-leading", "industry leading", "game-changing", "game changing",
  "next-generation", "revolutionized", "revolutionary", "transformed the", "transformational leader",
  "passionate about", "passion for", "thrilled to", "incredibly excited", "deeply committed", "highly motivated",
  "thought leader", "visionary", "guru", "ninja", "rockstar", "rock star", "wizard", "evangelist",
  "ai expert", "ml enthusiast", "tech enthusiast", "results-driven", "results driven", "results-oriented",
  "go-getter", "self-starter", "team player", "detail-oriented", "detail oriented", "hard-working", "hardworking",
  "synerg", "dynamic professional", "seasoned professional", "proven track record", "track record of success",
  "out-of-the-box", "think outside the box", "hit the ground running", "wear many hats", "go above and beyond",
  "responsible for", "duties included", "references available",
];

// Weak or AI-cadence openers. MAJOR when a bullet starts with one.
const WEAK_OPENERS = [
  "spearheaded", "leveraged", "orchestrated", "utilized", "championed", "pioneered", "revolutionized",
  "helped", "assisted with", "assisted in", "worked on", "worked with", "participated in", "involved in",
  "was responsible", "tasked with", "supported the", "contributed to",
];

// Verbs allowed to repeat a little more than others (fine in moderation).
const REPEAT_LIMIT_DEFAULT = 2;

const SAFE_FONTS = new Set([
  "calibri", "cambria", "arial", "helvetica", "helvetica neue", "georgia", "garamond", "times new roman",
  "verdana", "tahoma", "trebuchet ms", "book antiqua", "palatino", "palatino linotype", "lato", "inter",
  "source sans pro", "source sans 3", "open sans", "roboto", "aptos", "segoe ui", "century gothic",
  "franklin gothic", "gill sans", "noto sans", "ibm plex sans",
]);

const SECTION_VOCAB = {
  experience: /^(professional |relevant |work |selected )?(experience|employment( history)?|work history|career history|professional background)$/i,
  education: /^(education( (and|&) (training|credentials|certifications))?|academic background)$/i,
  skills: /^(selected |core |key |technical )?(skills|technical skills|competencies|core competencies|technologies|technical proficiencies|tools (and|&) technologies|skills (and|&) tools)$/i,
  summary: /^(professional |executive |career )?(summary|profile|overview)$/i,
  objective: /^(career )?objective$/i,
  projects: /^(selected |key |notable )?(projects|public work|open source|portfolio|publications|talks)$/i,
  certifications: /^(certifications?|licenses?( (and|&) certifications?)?|credentials|clearance( (and|&) eligibility)?)$/i,
};

const STOPWORDS = new Set(("a an and are as at be been being by for from has have if in into is it its of on or that the their them there these they this to was were will with within without you your our we us he she i me my " +
  "about above across after again all also am any because before below between both but can could did do does doing down during each few further had having here how just more most no nor not now off once only other out over own same should so some such than then through too under until up very what when where which while who whom why would " +
  "ability able across advanced applicants apply application background based basic benefits best better bonus candidate candidates career collaborate collaboration collaborative communicate communication company competitive comprehensive cross culture day daily deliver demonstrated demonstrate description desired detail details drive driven duties dynamic effective effectively employer employment ensure environment equal etc excellent experience experienced expertise fast field focus following full functional gender global good great grow growth hands high highly ideal impact important including individual industry information job join key knowledge large leading level looking make manage managing meet members minimum mission multiple must need needs new nice offer opportunity opportunities orientation others paced part partner partners people plus position practices preferred prior problem problems process processes professional proficiency proficient program programs projects qualification qualifications race related relevant religion required requirements responsibilities responsibility role roles salary seeking senior sexual skill skills solutions solve status strong successful support team teams time tools track understanding using various veteran way ways well within work working world year years care comfortable compensation equity examples publicly end deeply thrive love enjoy want ideally bonus ability someone anyone everyone things something anything").split(/\s+/));

// Acronym <-> expansion pairs; both directions count as a keyword match.
const ACRONYMS = {
  "k8s": "kubernetes", "js": "javascript", "ts": "typescript", "ml": "machine learning", "ai": "artificial intelligence",
  "nlp": "natural language processing", "llm": "large language model", "llms": "large language models",
  "ci/cd": "continuous integration", "cicd": "continuous integration", "aws": "amazon web services", "gcp": "google cloud",
  "ux": "user experience", "ui": "user interface", "qa": "quality assurance", "sre": "site reliability engineering",
  "iac": "infrastructure as code", "rag": "retrieval augmented generation", "tdd": "test driven development",
  "crm": "customer relationship management", "erp": "enterprise resource planning", "kpi": "key performance indicator",
  "okr": "objectives and key results", "saas": "software as a service", "p&l": "profit and loss",
  "pmp": "project management professional", "cpa": "certified public accountant", "ehr": "electronic health record",
  "emr": "electronic medical record", "evms": "earned value management", "cam": "control account manager",
  "dod": "department of defense", "ts/sci": "top secret", "sdlc": "software development life cycle",
  "api": "application programming interface", "oop": "object oriented programming", "etl": "extract transform load",
  "poc": "proof of concept", "roi": "return on investment", "sow": "statement of work", "rfp": "request for proposal",
};

// Pairs worth carrying in both forms on the page (recruiters search either). Slang like k8s/js is matched but never suggested.
const SPELL_OUT = new Set(["ml", "nlp", "llm", "ci/cd", "sre", "iac", "rag", "tdd", "crm", "erp", "kpi", "okr", "p&l", "pmp", "cpa", "ehr", "emr", "evms", "cam", "dod", "sdlc", "etl", "sow", "rfp"]);

const MONTHS = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
const YEAR = "(?:19|20)\\d{2}";
const MONTH_YEAR = `(?:${MONTHS}\\s+${YEAR}|\\d{1,2}/${YEAR})`;
const dateRangeRe = () => new RegExp(`(${MONTH_YEAR}|${YEAR})\\s*(?:-|–|—|to|through)\\s*(${MONTH_YEAR}|${YEAR}|present|current|now|today|ongoing)`, "gi");

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const SEV = { BLOCKER: "BLOCKER", MAJOR: "MAJOR", MINOR: "MINOR", VERIFY: "VERIFY", INFO: "INFO" };

function finding(severity, rule, message, lines, maxLines = 8) {
  return { severity, rule, message, lines: (lines || []).slice(0, maxLines) };
}

function stem(w) {
  if (w.length <= 4) return w;
  if (w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.endsWith("ing") && w.length > 6) return w.slice(0, -3);
  if (w.endsWith("ed") && w.length > 5) return w.slice(0, -2);
  if (w.endsWith("es") && !w.endsWith("ses") && w.length > 5) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) return w.slice(0, -1);
  return w;
}

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9+#./&\s-]/g, " ")
    .replace(/(^|\s)[./&-]+|[./&-]+(\s|$)/g, " ")
    .split(/\s+/).filter(Boolean)
    .map(stem);
}

function ngramSet(tokens, maxN) {
  const set = new Set();
  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i + n <= tokens.length; i++) set.add(tokens.slice(i, i + n).join(" "));
  }
  return set;
}

function which(cmd) {
  const candidates = process.platform === "win32" ? [cmd + ".exe", cmd] : [cmd];
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    for (const c of candidates) {
      const p = path.join(dir, c);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

function wordCount(text) { return (text.match(/\S+/g) || []).length; }

// ------------------------------------------------------------------
// Rule groups
// ------------------------------------------------------------------

function checkStructure(structure, opts) {
  const f = [];
  if (!structure) return f;
  const contactRe = /@|\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|linkedin/i;
  for (const hf of structure.headerFooterText) {
    if (contactRe.test(hf.text)) f.push(finding(SEV.BLOCKER, "contact-in-header-footer", `contact details live in ${hf.part}; many parsers skip headers/footers. Move them into the body.`, [hf.text]));
    else f.push(finding(SEV.MINOR, "header-footer-text", `text in ${hf.part} may be dropped by parsers`, [hf.text]));
  }
  if (structure.columns > 1) f.push(finding(SEV.BLOCKER, "multi-column", `${structure.columns}-column layout; parsers read across columns and scramble order. Use one column.`));
  if (structure.textBoxes > 0) f.push(finding(SEV.BLOCKER, "text-boxes", `${structure.textBoxes} text box(es); text inside is often not extracted at all.`));
  if (structure.hiddenText > 0) f.push(finding(SEV.BLOCKER, "hidden-text", `${structure.hiddenText} hidden-text run(s) (w:vanish). Reads as keyword stuffing or prompt injection; remove.`));
  if (structure.whiteText > 0) f.push(finding(SEV.BLOCKER, "white-text", `${structure.whiteText} white-on-white run(s). Reads as keyword stuffing; remove.`));
  if (structure.tinyText > 0) f.push(finding(SEV.BLOCKER, "tiny-text", `${structure.tinyText} run(s) under 7pt. Reads as hidden keyword stuffing; remove.`));
  if (structure.tables > 0) f.push(finding(SEV.MAJOR, "tables", `${structure.tables} table(s). Cell order and merged cells still confuse parsers; use paragraphs and tab stops.`));
  if (structure.images > 0) f.push(finding(SEV.MAJOR, "images", `${structure.images} image/drawing object(s). Parsers ignore them; any text inside is lost, and photos are a bias risk in US/UK/CA/AU markets.`));
  if (structure.symbolGlyphs > 0) f.push(finding(SEV.MAJOR, "symbol-glyphs", `${structure.symbolGlyphs} Symbol/Wingdings glyph(s); they extract as garbage characters. Use plain bullets.`));
  if (structure.sectionBreaks > 1) f.push(finding(SEV.MINOR, "section-breaks", `${structure.sectionBreaks} section breaks; keep one section.`));
  if (structure.hasFootnotes) f.push(finding(SEV.MINOR, "footnotes", "footnotes are dropped by most parsers; inline the content."));

  const odd = structure.fonts.filter((n) => !SAFE_FONTS.has(n.toLowerCase()));
  if (odd.length) f.push(finding(SEV.MINOR, "font", `non-standard font(s): ${odd.join(", ")}. Fine for parsing, but may substitute on the reader's machine.`));

  if (structure.marginsIn) {
    const m = structure.marginsIn;
    const min = Math.min(m.top, m.right, m.bottom, m.left);
    if (min < 0.5) f.push(finding(SEV.MAJOR, "margins", `smallest margin is ${min}"; keep margins at 0.5" or more.`));
  }
  if (structure.pageSize && opts.paper !== "any") {
    const { widthIn, heightIn } = structure.pageSize;
    const isLetter = Math.abs(widthIn - 8.5) < 0.05 && Math.abs(heightIn - 11) < 0.05;
    const isA4 = Math.abs(widthIn - 8.27) < 0.05 && Math.abs(heightIn - 11.69) < 0.05;
    if (opts.paper === "letter" && !isLetter) f.push(finding(SEV.MINOR, "paper-size", `page is ${widthIn}x${heightIn} in (${isA4 ? "A4" : "custom"}); US employers expect Letter 8.5x11.`));
    if (opts.paper === "a4" && !isA4) f.push(finding(SEV.MINOR, "paper-size", `page is ${widthIn}x${heightIn} in; expected A4.`));
  }
  return f;
}

function checkHygiene(paragraphs, text) {
  const f = [];
  const lines = paragraphs.map((p) => p.text);
  const withText = (re) => lines.filter((l) => re.test(l));

  const em = withText(/—/);
  if (em.length) f.push(finding(SEV.BLOCKER, "em-dash", `${text.split("—").length - 1} em dash(es). House rule: replace with comma, colon, semicolon, period, or parentheses.`, em));
  const dd = withText(/\S--\S|\s--\s/);
  if (dd.length) f.push(finding(SEV.MAJOR, "double-hyphen", "double hyphen used as a dash.", dd));

  const lower = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) {
      const hits = lines.filter((l) => l.toLowerCase().includes(phrase));
      const sev = /^(responsible for|duties included|references available)$/.test(phrase) ? SEV.MAJOR : SEV.BLOCKER;
      f.push(finding(sev, "banned-phrase", `"${phrase}" is banned (marketing tone, self-awarded title, or filler).`, hits));
    }
  }

  const pronouns = withText(/\b(I|me|my|mine|myself|we|our|ours)\b/);
  const realPronouns = pronouns.filter((l) => !/\b(Type|Phase|Title|Class|Tier|Level|Category|Schedule|Section|Part|Volume|Article) I\b/.test(l));
  if (realPronouns.length) f.push(finding(SEV.MAJOR, "first-person", "first-person pronouns; resumes use implied subject.", realPronouns));

  const injection = withText(/ignore (all )?(previous|prior|above|earlier) (instructions|prompts)|as an ai\b|language model|rank (this|the) (candidate|applicant)|you are (a|an) (recruiter|assistant|hiring)|system prompt|chatgpt|disregard (the )?(above|previous)/i);
  if (injection.length) f.push(finding(SEV.BLOCKER, "prompt-injection", "text addressed to an AI screener. Companies flag this and reject.", injection));

  const protectedInfo = withText(/\b(date of birth|d\.?o\.?b\.?:|marital status|nationality:|religion:|age:\s*\d{2}|social security|ssn)\b/i);
  if (protectedInfo.length) f.push(finding(SEV.MAJOR, "protected-info", "protected or sensitive personal details; omit for US/UK/CA/AU applications.", protectedInfo));

  const titleLine = lines.slice(0, 3).filter((l) => /^(resume|curriculum vitae|cv)$/i.test(l.trim()));
  if (titleLine.length) f.push(finding(SEV.MINOR, "document-title", 'drop the "Resume"/"CV" title line; the name is the title.'));

  const dupes = new Map();
  for (const l of lines) if (l.trim().length > 30) dupes.set(l.trim(), (dupes.get(l.trim()) || 0) + 1);
  const repeated = [...dupes].filter(([, n]) => n > 1).map(([l]) => l);
  if (repeated.length) f.push(finding(SEV.MINOR, "duplicate-lines", "identical lines appear more than once.", repeated));

  const longLists = lines.filter((l) => l.split(",").length > 25);
  if (longLists.length) f.push(finding(SEV.MINOR, "keyword-wall", "a single line lists 25+ comma-separated items; group into 3-5 categories with context.", longLists));

  return f;
}

function checkBullets(paragraphs) {
  const f = [];
  const bullets = paragraphs.filter((p) => p.isBullet && p.text.trim());
  if (!bullets.length) {
    f.push(finding(SEV.MAJOR, "no-bullets", "no bullet points detected; experience should be bulleted accomplishments under bold role headers."));
    return f;
  }

  const firstWords = new Map();
  const weak = [];
  const long = [];
  const thin = [];
  const noVerb = [];
  for (const b of bullets) {
    const t = b.text.trim();
    const first = (t.match(/^[A-Za-z][A-Za-z-]*/) || [""])[0].toLowerCase();
    if (first) firstWords.set(first, (firstWords.get(first) || 0) + 1);
    if (WEAK_OPENERS.some((w) => t.toLowerCase().startsWith(w))) weak.push(t);
    if (t.length > 240) long.push(t);
    if (t.length < 30) thin.push(t);
    if (/^[a-z]/.test(t) && !/^(https?:\/\/|www\.|[a-z0-9.-]+\.[a-z]{2,}(\/|:|\s))/i.test(t)) noVerb.push(t);
  }
  const repeats = [...firstWords].filter(([, n]) => n > REPEAT_LIMIT_DEFAULT).map(([w, n]) => `${w} (${n})`);
  if (repeats.length) f.push(finding(SEV.MAJOR, "repeated-openers", `the same opening verb starts more than ${REPEAT_LIMIT_DEFAULT} bullets: ${repeats.join(", ")}. Vary verbs; uniform openers read as generated.`));
  if (weak.length) f.push(finding(SEV.MAJOR, "weak-opener", "bullet opens with a filler or AI-cadence verb (spearheaded, leveraged, orchestrated, helped, worked on...). Use a plain specific verb.", weak));
  if (long.length) f.push(finding(SEV.MAJOR, "bullet-too-long", "bullet runs past two lines (~240 chars). Split or cut.", long));
  if (thin.length) f.push(finding(SEV.MINOR, "bullet-too-thin", "bullet under 30 characters carries no scope or outcome.", thin));
  if (noVerb.length) f.push(finding(SEV.MINOR, "bullet-lowercase-start", "bullet starts lowercase.", noVerb));

  let run = 0, maxRun = 0;
  for (const p of paragraphs) { run = p.isBullet ? run + 1 : 0; maxRun = Math.max(maxRun, run); }
  if (maxRun > 7) f.push(finding(SEV.MINOR, "bullet-run", `${maxRun} consecutive bullets under one header; cap around 6 for the lead role and 2-4 for older roles.`));

  const metricRe = /\d+(\.\d+)?\s?%|\$\s?\d[\d,.]*\s?[kmb]?\b|\b\d+(\.\d+)?x\b|\b\d[\d,]*\+|\b(over|more than|nearly|approximately|about)\s+\d[\d,]*/i;
  const metrics = bullets.map((b) => b.text.trim()).filter((t) => metricRe.test(t));
  if (metrics.length) f.push(finding(SEV.VERIFY, "quantified-claims", `${metrics.length} quantified claim(s). Each must trace to an evidence-ledger entry and survive "how did you measure that?"`, metrics));
  return f;
}

function checkContact(paragraphs, structure) {
  const f = [];
  const head = paragraphs.slice(0, 8).map((p) => p.text).join(" \n ");
  const all = paragraphs.map((p) => p.text).join("\n");
  const inHF = structure ? structure.headerFooterText.map((h) => h.text).join(" ") : "";

  if (!/[\w.+-]+@[\w-]+\.[\w.-]+/.test(all)) f.push(finding(SEV.BLOCKER, "no-email", "no email address in the body" + (/@/.test(inHF) ? " (only in header/footer)" : "") + "."));
  if (!/(\+?\d[\d\s().-]{8,}\d)/.test(all)) f.push(finding(SEV.MAJOR, "no-phone", "no phone number found."));
  if (!/linkedin\.com|github\.com|https?:\/\/|www\.|\.(com|io|dev|net|org|ai)\b/i.test(head)) f.push(finding(SEV.INFO, "no-link", "no LinkedIn or portfolio URL near the top (fine if the candidate asked for none)."));
  if (!/\b[A-Z][a-zA-Z.\s]+,\s?[A-Z]{2}\b|\bremote\b|\b(united states|usa|uk|canada|germany|france|india|australia)\b/i.test(head)) f.push(finding(SEV.MINOR, "no-location", "no city/state, country, or remote statement near the top; recruiters filter on location."));
  if (/\b\d{2,5}\s+[A-Z][a-z]+\s+(St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Ln|Lane|Way|Ct)\b/.test(head)) f.push(finding(SEV.MINOR, "street-address", "street address present; city and state are enough."));

  const nameLine = (paragraphs.find((p) => p.text.trim()) || { text: "" }).text.trim();
  if (nameLine.length > 45) f.push(finding(SEV.MINOR, "name-line", "first line is long; the name should stand alone.", [nameLine]));
  return f;
}

function detectHeaders(paragraphs) {
  const headers = [];
  paragraphs.forEach((p, i) => {
    const t = p.text.trim();
    if (!t || t.length > 45 || /[.!?:]$/.test(t) || p.isBullet) return;
    const looksLikeHeader = p.allBold || p.hasBorder || (t === t.toUpperCase() && /[A-Z]{3,}/.test(t)) || /^Heading/i.test(p.styleId);
    if (!looksLikeHeader) return;
    let kind = "other";
    for (const [k, re] of Object.entries(SECTION_VOCAB)) if (re.test(t)) { kind = k; break; }
    headers.push({ index: i, text: t, kind });
  });
  return headers;
}

function checkSections(paragraphs, opts) {
  const f = [];
  const headers = detectHeaders(paragraphs);
  const kinds = new Set(headers.map((h) => h.kind));
  const n = paragraphs.length;

  if (!kinds.has("experience")) f.push(finding(SEV.BLOCKER, "no-experience-header", 'no recognizable Experience header. Use "Experience" or "Professional Experience".'));
  if (!kinds.has("education")) f.push(finding(SEV.MAJOR, "no-education-header", 'no recognizable Education header.'));
  if (!kinds.has("skills")) f.push(finding(SEV.MAJOR, "no-skills-header", 'no recognizable Skills header.'));
  if (kinds.has("objective")) f.push(finding(SEV.MINOR, "objective", 'an "Objective" section reads dated; use a 3-5 sentence Summary.'));

  const firstKnown = headers.find((h) => h.kind !== "other");
  const creative = headers.filter((h) => h.kind === "other" && firstKnown && h.index > firstKnown.index && !/\|/.test(h.text) && h.text.split(/\s+/).length <= 4 && !/\d/.test(h.text));
  if (creative.length) f.push(finding(SEV.INFO, "unclassified-header", "bold/caps lines that are not standard section names (role headers are fine; creative section names are not).", creative.map((h) => h.text)));

  const exp = headers.find((h) => h.kind === "experience");
  const edu = headers.find((h) => h.kind === "education");
  if (exp && edu && edu.index < exp.index && opts.targetPages !== 1) f.push(finding(SEV.INFO, "education-first", "Education precedes Experience; right for new grads and academia, wrong for experienced candidates."));

  // Top-third test: a dated role should be visible early.
  const cut = Math.max(10, Math.floor(n * 0.35));
  const early = paragraphs.slice(0, cut).map((p) => p.text).join("\n");
  if (!dateRangeRe().test(early)) f.push(finding(SEV.MAJOR, "top-third", "no dated role in the top third of page one. Recruiters look for current title, company, and dates first."));
  return f;
}

function parseDate(s) {
  s = s.toLowerCase().replace(/\./g, "");
  if (/present|current|now|today|ongoing/.test(s)) return { y: 9999, m: 12, kind: "present" };
  let m = s.match(/^(\d{1,2})\/((?:19|20)\d{2})$/);
  if (m) return { y: +m[2], m: +m[1], kind: "month" };
  m = s.match(new RegExp(`^(${MONTHS})\\s+((?:19|20)\\d{2})$`));
  if (m) {
    const idx = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].findIndex((k) => m[1].startsWith(k));
    return { y: +m[2], m: idx + 1, kind: "month" };
  }
  m = s.match(/^((?:19|20)\d{2})$/);
  if (m) return { y: +m[1], m: null, kind: "year" };
  return null;
}

function checkDates(paragraphs, opts) {
  const f = [];
  const lines = paragraphs.map((p) => p.text);
  const ranges = [];
  const seps = new Set();
  const presentWords = new Set();
  for (const line of lines) {
    for (const m of line.matchAll(dateRangeRe())) {
      const a = parseDate(m[1]); const b = parseDate(m[2]);
      if (!a || !b) continue;
      ranges.push({ line, a, b });
      const sep = m[0].match(/\s*(-|–|—|to|through)\s*/)[1];
      seps.add(sep === "–" ? "en dash" : sep === "—" ? "em dash" : sep === "-" ? "hyphen" : sep);
      if (b.kind === "present") presentWords.add(m[2].toLowerCase());
    }
  }
  if (!ranges.length) { f.push(finding(SEV.MAJOR, "no-date-ranges", "no date ranges found; every role needs start and end (Month YYYY preferred).")); return f; }

  const kinds = new Set(ranges.flatMap((r) => [r.a.kind, r.b.kind]).filter((k) => k !== "present"));
  if (kinds.has("year") && kinds.has("month")) f.push(finding(SEV.MINOR, "mixed-date-precision", "some ranges use Month YYYY and others YYYY only; pick one (Month YYYY is what parsers and recruiters expect).", ranges.filter((r) => r.a.kind === "year").map((r) => r.line)));
  else if (kinds.has("year") && !kinds.has("month") && opts.profile === "federal") f.push(finding(SEV.MAJOR, "year-only-dates", "federal resumes must show month and year for every position.", ranges.map((r) => r.line)));
  else if (kinds.has("year") && !kinds.has("month")) f.push(finding(SEV.INFO, "year-only-dates", "year-only ranges hide tenure; Month YYYY is the safer default."));
  if (seps.size > 1) f.push(finding(SEV.MINOR, "mixed-range-separators", `date ranges mix separators (${[...seps].join(", ")}); use one style.`));
  if (presentWords.size > 1) f.push(finding(SEV.MINOR, "mixed-present", `mixed "${[...presentWords].join('" / "')}"; pick one.`));

  const now = new Date();
  const future = ranges.filter((r) => (r.a.y > now.getFullYear()) || (r.b.kind !== "present" && (r.b.y > now.getFullYear() || (r.b.y === now.getFullYear() && r.b.m && r.b.m > now.getMonth() + 1))));
  if (future.length) f.push(finding(SEV.BLOCKER, "future-date", "a date is in the future; fix the typo.", future.map((r) => r.line)));

  const reversed = ranges.filter((r) => r.b.kind !== "present" && (r.b.y < r.a.y || (r.b.y === r.a.y && r.a.m && r.b.m && r.b.m < r.a.m)));
  if (reversed.length) f.push(finding(SEV.BLOCKER, "reversed-range", "end date precedes start date.", reversed.map((r) => r.line)));

  // Gap scan on the timeline (union of ranges), conservative thresholds.
  const toIdx = (d, end) => d.y * 12 + (d.m || (end ? 12 : 1));
  const sorted = ranges.filter((r) => r.a.y < 9999).map((r) => ({ s: toIdx(r.a, false), e: r.b.kind === "present" ? now.getFullYear() * 12 + now.getMonth() + 1 : toIdx(r.b, true), line: r.line })).sort((x, y) => x.s - y.s);
  let reach = -Infinity; const gaps = [];
  for (const r of sorted) {
    if (reach !== -Infinity && r.s - reach > (kinds.has("month") ? 7 : 12)) gaps.push(`${Math.round((r.s - reach) / 12 * 10) / 10} yr gap before: ${r.line}`);
    reach = Math.max(reach, r.e);
  }
  if (gaps.length) f.push(finding(SEV.INFO, "timeline-gap", "gap on the timeline; add a neutral one-line label if it will be asked about (do not fudge dates).", gaps));

  const order = sorted.map((r) => r.s);
  // Reverse chronological within the experience block is expected; reading order should mostly descend.
  let ascendingPairs = 0;
  for (let i = 1; i < ranges.length; i++) if (toIdx(ranges[i].a, false) > toIdx(ranges[i - 1].a, false)) ascendingPairs++;
  if (ranges.length >= 3 && ascendingPairs > ranges.length / 2) f.push(finding(SEV.INFO, "chronology", "roles appear in ascending date order; reverse-chronological (or relevance-first with clear dates) is expected."));
  void order;
  return f;
}

function checkFederal(text) {
  // OPM two-page guidance (effective 2025-09-27): page cap is enforced; the field list is advisory.
  const f = [];
  if (!/hours?\s*(per|\/|a)\s*week|hrs?\s*\/\s*w(ee)?k/i.test(text)) f.push(finding(SEV.MAJOR, "federal-hours", "OPM guidance lists hours worked per week for each position; add it to every role line."));
  if (!/\d{2}\/(?:19|20)\d{2}\s*(?:-|–|to)\s*(?:\d{2}\/(?:19|20)\d{2}|present)/i.test(text)) f.push(finding(SEV.MAJOR, "federal-date-format", "OPM shows dates as MM/YYYY – MM/YYYY (e.g., 05/2019 – 08/2022); use that format for every role."));
  if (/\bGS-?\d{1,2}\b/i.test(text) === false && /federal|department of|agency|u\.s\. (army|navy|air force|government)/i.test(text)) f.push(finding(SEV.MINOR, "federal-grade", "list series and grade (e.g., GS-0343-12) for any federal positions held."));
  if (/supervisor|may (we|i) contact|salary:/i.test(text)) f.push(finding(SEV.INFO, "federal-legacy-fields", "supervisor contact and salary are no longer in OPM's field list; keep only if the announcement asks, they cost page budget."));
  return f;
}

// ------------------------------------------------------------------
// Pages
// ------------------------------------------------------------------

function estimatePages(paragraphs, structure) {
  const bodyPt = (() => {
    const sizes = paragraphs.flatMap((p) => p.sizes);
    if (!sizes.length) return 11;
    const counts = new Map(); for (const s of sizes) counts.set(s, (counts.get(s) || 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1])[0][0];
  })();
  const pw = structure && structure.pageSize ? structure.pageSize.widthIn : 8.5;
  const ph = structure && structure.pageSize ? structure.pageSize.heightIn : 11;
  const m = structure && structure.marginsIn ? structure.marginsIn : { top: 1, right: 1, bottom: 1, left: 1 };
  const textW = pw - m.left - m.right;
  const textH = ph - m.top - m.bottom;
  const charsPerLine = Math.floor(textW * (165 / bodyPt)); // ~16.5 cpi at 10pt for Calibri-class fonts
  const lineHeightIn = (bodyPt * 1.42) / 72; // line spacing plus average paragraph spacing
  const linesPerPage = Math.floor(textH / lineHeightIn);
  let lines = 0;
  for (const p of paragraphs) {
    const t = p.text.trim();
    if (!t) { lines += 0.5; continue; }
    const width = p.isBullet ? charsPerLine - 5 : charsPerLine;
    lines += Math.max(1, Math.ceil(t.length / width)) + (p.hasBorder ? 0.8 : 0);
  }
  return { value: Math.max(1, Math.ceil(lines / linesPerPage)), method: "estimate", lines: Math.round(lines), linesPerPage };
}

function measurePages(file) {
  const candidates = [which("soffice"), which("libreoffice"), "/Applications/LibreOffice.app/Contents/MacOS/soffice"].filter((p) => p && fs.existsSync(p));
  if (!candidates.length || !/\.docx$/i.test(file)) return null;
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-check-"));
  try {
    execFileSync(candidates[0], ["--headless", "--convert-to", "pdf", "--outdir", outDir, file], { stdio: "ignore", timeout: 90000 });
    const pdf = path.join(outDir, path.basename(file).replace(/\.docx$/i, ".pdf"));
    const bytes = fs.readFileSync(pdf, "latin1");
    const pages = (bytes.match(/\/Type\s*\/Page[^s]/g) || []).length;
    return pages ? { value: pages, method: "libreoffice", pdf } : null;
  } catch (e) {
    return null;
  } finally {
    // keep the PDF for visual spot checks; caller may report the path
  }
}

// ------------------------------------------------------------------
// Keyword coverage
// ------------------------------------------------------------------

function requirementLines(jdText) {
  const lines = jdText.split(/\r?\n/);
  const out = [];
  let inReq = false;
  const startRe = /(requirements?|qualifications?|must[- ]haves?|what you.ll (bring|need)|what we.re looking for|you (have|are|bring)|minimum|basic qualifications|preferred|nice to have|about you|who you are|thrive|ideal candidate|skills (and|&) experience)/i;
  const stopRe = /(benefits|compensation|about (us|the company|the team)|equal opportunity|what we offer|perks|salary|how to apply|our values)/i;
  for (const l of lines) {
    const t = l.trim();
    if (!t) continue;
    if (t.length < 80 && startRe.test(t)) { inReq = true; continue; }
    if (t.length < 80 && stopRe.test(t)) { inReq = false; continue; }
    if (inReq) out.push(t);
  }
  return out;
}

function jdTerms(jdText) {
  const reqText = requirementLines(jdText).join("\n");
  const score = new Map();
  const surface = new Map();
  const INNER_OK = new Set(["as", "of"]);
  const bump = (stems, words, w) => {
    const k = stems.join(" ");
    score.set(k, (score.get(k) || 0) + w);
    if (!surface.has(k)) surface.set(k, words.join(" "));
  };
  // N-grams are built inside clauses only, so list fragments ("python, postgresql") never fuse.
  const clauseSplit = /[\n,;:()[\]•|]|\s\/\s|\s[-–—]\s|\.\s|\s(?:and|or|with|using|via|including|such as|e\.g\.|i\.e\.)\s/i;
  const addFrom = (text, w) => {
    for (const clause of text.split(clauseSplit)) {
      const words = clause.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9+#./&\s-]/g, " ")
        .split(/\s+/).map((x) => x.replace(/^[./&-]+|[./&-]+$/g, "")).filter(Boolean);
      const stems = words.map(stem);
      for (let i = 0; i < stems.length; i++) {
        for (let n = 1; n <= 3 && i + n <= stems.length; n++) {
          const sl = stems.slice(i, i + n);
          if (STOPWORDS.has(sl[0]) || STOPWORDS.has(sl[n - 1])) continue;
          if (sl.slice(1, -1).some((x) => STOPWORDS.has(x) && !INNER_OK.has(x))) continue;
          if (sl.some((x) => /^\d+\+?$/.test(x) || x.length < 2)) continue;
          if (n === 1 && sl[0].length < 3 && !/[+#]/.test(sl[0])) continue;
          bump(sl, words.slice(i, i + n), w);
        }
      }
    }
  };
  addFrom(jdText, 1);
  addFrom(reqText, 2);

  // Technical-looking tokens from the original casing: acronyms, CamelCase, tokens with digits or symbols.
  const techy = new Set();
  for (const m of jdText.matchAll(/\b([A-Z][A-Z0-9+#./-]{1,9}|[A-Za-z]+\d[A-Za-z0-9]*|[A-Za-z]+[+#]{1,2}|[A-Za-z]+\.(?:js|py|net|io)|[a-z]+[A-Z][A-Za-z]+)\b/g)) {
    const raw = m[1].replace(/[-./]+$/, "");
    const t = stem(raw.toLowerCase());
    if (!raw || STOPWORDS.has(t) || t.length < 2 || /^\d+\+?$/.test(t)) continue;
    techy.add(t);
    bump([t], [raw], 2);
  }

  const candidates = [...score].filter(([t, sc]) => sc >= 3 || techy.has(t));
  const isPhraseOf = (short, long) => long !== short && long.split(" ").length > short.split(" ").length && (" " + long + " ").includes(" " + short + " ");
  const kept = candidates
    .filter(([t]) => !candidates.some(([k, ks]) => isPhraseOf(t, k) && ks >= 3))
    .sort((a, b) => b[1] - a[1] || b[0].split(" ").length - a[0].split(" ").length)
    .slice(0, 45);
  return kept.map(([t, sc]) => ({ stem: t, surface: surface.get(t) || t, score: sc }));
}

function checkKeywords(resumeText, jdText, must) {
  const f = [];
  const resumeTokens = tokenize(resumeText);
  const grams = ngramSet(resumeTokens, 4);
  const lowerResume = resumeText.toLowerCase();
  const escapeRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const boundaryHas = (phrase) => new RegExp(`(^|[^a-z0-9])${escapeRe(phrase.toLowerCase())}([^a-z0-9]|$)`).test(lowerResume);
  const present = (stemPhrase, surfacePhrase) => {
    if (grams.has(stemPhrase) || grams.has(stemPhrase.replace(/\s+/g, ""))) return true;
    for (const [acr, exp] of Object.entries(ACRONYMS)) {
      const expStem = tokenize(exp).join(" ");
      if ((stemPhrase === acr && grams.has(expStem)) || (stemPhrase === expStem && grams.has(acr))) return true;
    }
    return boundaryHas(surfacePhrase || stemPhrase);
  };

  if (jdText) {
    const terms = jdTerms(jdText);
    const missing = terms.filter((t) => !present(t.stem, t.surface));
    const found = terms.length - missing.length;
    f.push(finding(SEV.INFO, "keyword-coverage", `diagnostic only, not an ATS score: ${found} of ${terms.length} candidate JD terms appear in the resume.`));
    if (missing.length) f.push(finding(SEV.VERIFY, "jd-terms-missing", "JD terms not found in the resume, highest weight first. Judge each: genuine gap (say so in the fit assessment), same skill under another name (use the JD's wording once), or irrelevant (ignore). Never add a term the candidate cannot defend.", missing.map((t) => `${t.surface} (w${t.score})`), 30));

    const lowerJd = jdText.toLowerCase();
    const inText = (text, acr) => new RegExp(`(^|[^a-z0-9])${escapeRe(acr)}([^a-z0-9]|$)`).test(text);
    const oneForm = [];
    for (const acr of SPELL_OUT) {
      const exp = ACRONYMS[acr];
      if (!(inText(lowerJd, acr) || lowerJd.includes(exp))) continue;
      const hasAcr = inText(lowerResume, acr);
      const hasExp = lowerResume.includes(exp);
      if (hasAcr !== hasExp) oneForm.push(hasAcr ? `${acr.toUpperCase()}: also spell out "${exp}" once` : `${exp}: also include "${acr.toUpperCase()}" once`);
    }
    if (oneForm.length) f.push(finding(SEV.MINOR, "acronym-both-forms", "keyword appears in only one form; parsers do not always map acronym to expansion.", oneForm));
  }

  if (must && must.length) {
    const absent = must.filter((m) => !present(tokenize(m).join(" "), m));
    if (absent.length) f.push(finding(SEV.MAJOR, "must-have-missing", "required term(s) not present.", absent));
    else f.push(finding(SEV.INFO, "must-have-present", `all ${must.length} required term(s) present.`));
  }
  return f;
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { file: null, jd: null, must: [], targetPages: 2, profile: "standard", paper: "letter", text: null, json: false, strict: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--jd") opts.jd = next();
    else if (a === "--must") opts.must = next().split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--target-pages") opts.targetPages = Number(next());
    else if (a === "--profile") opts.profile = next();
    else if (a === "--paper") opts.paper = next();
    else if (a === "--text") opts.text = next();
    else if (a === "--json") opts.json = true;
    else if (a === "--strict") opts.strict = true;
    else if (a.startsWith("--")) { console.error(`unknown option ${a}`); process.exit(2); }
    else opts.file = a;
  }
  if (!opts.file) { console.error("usage: node resume-check.js <resume.docx|.txt|.md> [--jd jd.txt] [--must a,b] [--target-pages n] [--profile standard|federal] [--paper letter|a4|any] [--text out.txt] [--json] [--strict]"); process.exit(2); }
  if (opts.profile === "federal") opts.targetPages = Math.min(opts.targetPages, 2);
  return opts;
}

function run(opts) {
  const { text, paragraphs, structure } = readAny(opts.file);
  if (opts.text) fs.writeFileSync(opts.text, text + "\n");

  const findings = [
    ...checkStructure(structure, opts),
    ...checkHygiene(paragraphs, text),
    ...checkBullets(paragraphs),
    ...checkContact(paragraphs, structure),
    ...checkSections(paragraphs, opts),
    ...checkDates(paragraphs, opts),
  ];
  if (opts.profile === "federal") findings.push(...checkFederal(text));

  const pages = measurePages(opts.file) || estimatePages(paragraphs, structure);
  if (pages.value > opts.targetPages) findings.push(finding(pages.method === "estimate" ? SEV.MAJOR : SEV.BLOCKER, "page-budget", `${pages.value} page(s) (${pages.method}) against a budget of ${opts.targetPages}. Tighten: compress older roles, cut the weakest bullets, merge skill lines.`));
  else findings.push(finding(SEV.INFO, "page-budget", `${pages.value} page(s) (${pages.method}${pages.method === "estimate" ? "; install LibreOffice for an exact count" : ""}), budget ${opts.targetPages}.`));

  const words = wordCount(text);
  findings.push(finding(SEV.INFO, "word-count", `${words} words.`));

  let jdText = null;
  if (opts.jd) jdText = fs.readFileSync(opts.jd, "utf8");
  findings.push(...checkKeywords(text, jdText, opts.must));

  const order = { BLOCKER: 0, MAJOR: 1, MINOR: 2, VERIFY: 3, INFO: 4 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);
  const counts = findings.reduce((c, x) => (c[x.severity] = (c[x.severity] || 0) + 1, c), {});
  const failed = (counts.BLOCKER || 0) > 0 || (opts.strict && (counts.MAJOR || 0) > 0);

  const topThird = paragraphs.slice(0, Math.max(10, Math.floor(paragraphs.length * 0.35))).map((p) => (p.isBullet ? "• " : "") + p.text).filter((l) => l.trim());
  return { file: opts.file, source: structure ? "docx" : "text", pages, structure, counts, failed, findings, topThird, words };
}

function printReport(r) {
  const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);
  console.log(`resume-check: ${r.file}  [${r.source}]  pages: ${r.pages.value} (${r.pages.method})  words: ${r.words}`);
  console.log("");
  for (const f of r.findings) {
    console.log(`${pad(f.severity, 8)} [${f.rule}] ${f.message}`);
    for (const l of f.lines) console.log(`           - ${l.length > 160 ? l.slice(0, 157) + "..." : l}`);
  }
  console.log("");
  console.log("top-third preview (what a 7-second scan sees):");
  for (const l of r.topThird.slice(0, 14)) console.log(`  | ${l.length > 120 ? l.slice(0, 117) + "..." : l}`);
  console.log("");
  const c = r.counts;
  console.log(`summary: ${c.BLOCKER || 0} blocker, ${c.MAJOR || 0} major, ${c.MINOR || 0} minor, ${c.VERIFY || 0} verify, ${c.INFO || 0} info → ${r.failed ? "FAIL" : "PASS"}`);
}

if (require.main === module) {
  const opts = parseArgs(process.argv.slice(2));
  let report;
  try { report = run(opts); } catch (e) { console.error(`resume-check: ${e.message}`); process.exit(2); }
  if (opts.json) process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  else printReport(report);
  process.exit(report.failed ? 1 : 0);
}

module.exports = { run };
