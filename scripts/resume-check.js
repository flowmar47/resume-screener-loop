#!/usr/bin/env node
/**
 * resume-check.js
 *
 * Deterministic resume checker. Runs the parts of the screener loop that a
 * script can do better than a model: ATS parse safety, house style rules,
 * structure, dates, page budget, blinding, ledger provenance, and JD keyword coverage.
 *
 * Zero dependencies (Node >= 18). Uses ./docx-text.js for DOCX input.
 * Optional: LibreOffice (soffice) for an exact page count; otherwise estimated.
 *
 * usage:
 *   node resume-check.js <resume.docx|.txt|.md> [options]
 *
 * options:
 *   --jd <file>              job description text; enables keyword coverage
 *   --must "a,b,c"           terms that must appear (hard requirements); MAJOR if absent
 *   --target-pages <n>       page budget (default 2; use 1 for new grads)
 *   --profile <name>         standard (default) | federal
 *   --paper <letter|a4|any>  expected paper size (default letter)
 *   --text <out.txt>         also write the ATS-extracted plain text
 *   --blind <out.txt>        write a Phase 5 blinded plain-text copy (Candidate, contact stripped)
 *   --ledger <path>          check [E#] citations in draft bullets against ledger.md
 *   --pdf <file.pdf>         use a pre-rendered PDF for exact page count
 *   --json                   machine-readable report on stdout
 *   --strict                 MAJOR findings also fail the run
 *   --no-render              skip the LibreOffice page count (estimate only)
 *   --help, -h               show this help message
 *
 * exit codes: 0 pass, 1 blockers (or majors with --strict), 2 usage error
 *
 * This is a diagnostic, not an ATS verdict. No employer system publishes a
 * score; the keyword section lists candidate gaps for a human or agent to judge.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { readAny } = require("./docx-text");
const { renderPdf, pdfPageCount } = require("./render-pdf");

// ------------------------------------------------------------------
// Word lists
// ------------------------------------------------------------------

// Hard-banned phrasing (house rule + recruiter AI-cadence tells). BLOCKER.
const BANNED_PHRASES = [
  "world-class", "world class", "best-in-class", "best in class", "cutting-edge", "cutting edge",
  "unparalleled", "groundbreaking", "industry-leading", "industry leading", "game-changing", "game changing",
  "next-generation", "revolutionized", "revolutionary", "transformed the", "transformational leader",
  "passionate about", "passion for", "thrilled to", "incredibly excited", "deeply committed", "highly motivated",
  "thought leader", "visionary", "guru", "rockstar", "rock star",
  "ai expert", "ml enthusiast", "tech enthusiast", "results-driven", "results driven", "results-oriented",
  "go-getter", "self-starter", "team player", "detail-oriented", "detail oriented", "hard-working", "hardworking",
  "dynamic professional", "seasoned professional", "proven track record", "track record of success",
  "out-of-the-box", "think outside the box", "hit the ground running", "wear many hats", "go above and beyond",
  "delved", "delve into", "tapestry", "beacon of", "testament to", "rich landscape", "pivotal role", "state-of-the-art",
  "responsible for", "duties included", "references available",
];

// Pattern-based banned checks for stem/ambiguous words (avoid false positives like "CMake and Ninja", "Developer Evangelist", "setup wizard").
const BANNED_PATTERNS = [
  { label: "synergy", re: /\bsynerg[a-z]*\b/i },
  {
    label: "ninja",
    re: /\b(?:code|coding|tech|software|data|sales|marketing|devops|growth|product|full[- ]stack|javascript|python|css|html|sql|excel)\s+ninja\b|\bninja\s+(?:coder|developer|engineer|at)\b/i,
  },
  {
    label: "wizard",
    re: /(?<!\b(?:setup|install|installation|configuration|config|migration|onboarding|import|export|booking|checkout|form|multi[- ]step|step[- ]by[- ]step)\s+)\bwizard\b(?!\s*(?:ui|ux|flow|dialog|modal|screen|step|steps|component|interface|page)\b)/i,
  },
  {
    label: "evangelist",
    re: /(?<!\b(?:developer|technical|product|partner|community|open[- ]source|cloud|platform|security|solutions|field|chief)\s+)\bevangelist\b/i,
  },
];

// Weak or AI-cadence openers. MAJOR when a bullet starts with one.
const WEAK_OPENERS = [
  "spearheaded", "leveraged", "orchestrated", "utilized", "championed", "pioneered", "revolutionized",
  "helped", "assisted with", "assisted in", "worked on", "worked with", "participated in", "involved in",
  "was responsible", "tasked with", "supported the", "contributed to", "fostered", "streamlined", "drove",
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

const MONTHS = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?";
const YEAR = "(?:19|20)\\d{2}";
const MONTH_YEAR = `(?:${MONTHS}\\s+${YEAR}|\\d{1,2}/${YEAR})`;
const dateRangeRe = () => new RegExp(`\\b(${MONTH_YEAR}|${YEAR})\\s*(?:-|–|—|to|through)\\s*(${MONTH_YEAR}|${YEAR}|present|current|now|today|ongoing)\\b`, "gi");

const METRIC_RE = /\d+(\.\d+)?\s?%|\$\s?\d[\d,.]*\s?[kmb]?\b|\b\d+(\.\d+)?x\b|\b\d[\d,]*\+|\b(over|more than|nearly|approximately|about)\s+\d[\d,]*/i;

const REGION_CODES = "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|PR|AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT|UK|US|EU|ST";
const COUNTRY_RE = /\b(united states|usa|u\.s\.a?\.|united kingdom|uk|england|scotland|wales|canada|germany|deutschland|france|india|australia|netherlands|switzerland|ireland|israel|japan|singapore|sweden|norway|denmark|finland|spain|italy|portugal|poland|austria|belgium|brazil|mexico|south korea|taiwan|new zealand|uae|united arab emirates|china|hong kong|czechia|czech republic|romania|estonia|argentina|chile|colombia)\b/i;
const GLOBAL_CITIES_RE = /\b(london|berlin|paris|amsterdam|zurich|zürich|dublin|toronto|vancouver|montreal|montréal|sydney|melbourne|singapore|tokyo|seoul|bengaluru|bangalore|hyderabad|mumbai|delhi|gurugram|pune|tel aviv|stockholm|copenhagen|munich|münchen|frankfurt|barcelona|madrid|milan|vienna|warsaw|prague|lisbon|brussels|oslo|helsinki|auckland|hong kong|taipei|são paulo|sao paulo|new york|san francisco|los angeles|seattle|chicago|boston|austin|denver|atlanta|washington,?\s*d\.?c\.?|miami|dallas|houston|phoenix|san diego|philadelphia|minneapolis|portland|raleigh)\b/i;

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const SEV = { BLOCKER: "BLOCKER", MAJOR: "MAJOR", MINOR: "MINOR", VERIFY: "VERIFY", INFO: "INFO" };

function finding(severity, rule, message, lines, maxLines = 8) {
  return { severity, rule, message, lines: (lines || []).slice(0, maxLines) };
}

function escapeRe(x) {
  return x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function wordCount(text) { return (text.match(/\S+/g) || []).length; }

function extractPhones(text) {
  const matches = [];
  for (const m of text.matchAll(/(\+?\(?\d[\d\s().-]{5,20}\d)/g)) {
    const cand = m[1].trim();
    if (/[\r\n]/.test(cand)) continue;
    // Exclude YYYY - YYYY year ranges and 5+4 US ZIP+4 codes.
    if (/^(?:19|20)\d{2}\s*[-–—\s]\s*(?:19|20)\d{2}$/.test(cand)) continue;
    if (/^\d{5}-\d{4}$/.test(cand)) continue;
    const digits = cand.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) continue;
    matches.push(cand);
  }
  return matches;
}

function hasPhoneNumber(text) {
  return extractPhones(text).length > 0;
}

// ------------------------------------------------------------------
// Rule groups
// ------------------------------------------------------------------

function checkStructure(structure, opts) {
  const f = [];
  if (!structure) return f;
  for (const hf of structure.headerFooterText) {
    if (/@|linkedin/i.test(hf.text) || hasPhoneNumber(hf.text)) {
      f.push(finding(SEV.BLOCKER, "contact-in-header-footer", `contact details live in ${hf.part}; many parsers skip headers/footers. Move them into the body.`, [hf.text]));
    } else {
      f.push(finding(SEV.MINOR, "header-footer-text", `text in ${hf.part} may be dropped by parsers`, [hf.text]));
    }
  }
  if (structure.columns > 1) f.push(finding(SEV.BLOCKER, "multi-column", `${structure.columns}-column layout; parsers read across columns and scramble order. Use one column.`));
  if (structure.textBoxes > 0) f.push(finding(SEV.BLOCKER, "text-boxes", `${structure.textBoxes} text box(es); text inside is often not extracted at all.`));
  if (structure.hiddenText > 0) f.push(finding(SEV.BLOCKER, "hidden-text", `${structure.hiddenText} hidden-text run(s) (w:vanish/w:webHidden). Reads as keyword stuffing or prompt injection; remove.`));
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

function stripNonPronounTokens(line) {
  return line
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, " ")
    .replace(/\b[\w-]+\.me(?:\/\S*)?\b/gi, " ")
    .replace(/\bI\/O\b/gi, " ")
    .replace(/\b(?:i\.e\.|e\.g\.)/gi, " ")
    .replace(/\b[A-Z]\.I\./g, " ")
    .replace(/\(\s*i\s*\)/gi, " ")
    .replace(/\b(?:Engineer|Analyst|Developer|Technician|Specialist|Associate|Officer|Operator|Inspector|Coordinator|Consultant|Manager|Director|Scientist|Architect|Designer|Administrator|Programmer|Researcher|Fellow|Intern|Resident|Clerk|Nurse|Therapist|Planner|Buyer|Auditor|Accountant|Representative|Advisor|Lead|Staff|Type|Phase|Title|Class|Tier|Level|Category|Schedule|Section|Part|Volume|Article|Chapter|Stage|Grade|Step|Track|Wave|Group|Band|Rank|Model|Series|Version|Gen|Generation|Semester|Quarter|Module|Unit|Division|Annex|Appendix|Amendment)\s+I\b/g, " ")
    .replace(/\b(?!(?:that|what|which|when|where|how|why|who|and|but|or|as|so|if|than|yes|no)\b)[A-Z][a-zA-Z]+\s+I(?=\s*(?:$|[|,–—(-]))/g, " ");
}

function checkHygiene(paragraphs, text) {
  const f = [];
  const lines = paragraphs.map((p) => p.text);
  const withText = (re) => lines.filter((l) => re.test(l));

  const em = withText(/—/);
  if (em.length) f.push(finding(SEV.BLOCKER, "em-dash", `${text.split("—").length - 1} em dash(es). House rule: replace with comma, colon, semicolon, period, or parentheses.`, em));
  const dd = withText(/\S--\S|\s--\s/);
  if (dd.length) f.push(finding(SEV.MAJOR, "double-hyphen", "double hyphen used as a dash.", dd));

  for (const phrase of BANNED_PHRASES) {
    const re = new RegExp(`\\b${escapeRe(phrase)}\\b`, "i");
    const hits = lines.filter((l) => re.test(l));
    if (hits.length) {
      const sev = /^(responsible for|duties included|references available)$/.test(phrase) ? SEV.MAJOR : SEV.BLOCKER;
      f.push(finding(sev, "banned-phrase", `"${phrase}" is banned (marketing tone, self-awarded title, or filler).`, hits));
    }
  }

  for (const { label, re } of BANNED_PATTERNS) {
    const hits = lines.filter((l) => re.test(l));
    if (hits.length) {
      f.push(finding(SEV.BLOCKER, "banned-phrase", `"${label}" is banned (marketing tone, self-awarded title, or filler).`, hits));
    }
  }

  const pronounRe = /\b(?:I|me|my|mine|myself|we|our|ours)\b/i;
  const realPronouns = lines.filter((l) => pronounRe.test(stripNonPronounTokens(l)));
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

  const weakRes = WEAK_OPENERS.map((w) => new RegExp(`^${escapeRe(w)}\\b`, "i"));
  const firstWords = new Map();
  const weak = [];
  const long = [];
  const thin = [];
  const noVerb = [];
  const consecutive = [];

  let prevOpener = null;
  for (const p of paragraphs) {
    const t = p.text.trim();
    if (!t) continue;
    if (!p.isBullet) {
      prevOpener = null;
      continue;
    }
    const first = (t.match(/^[A-Za-z][A-Za-z-]*/) || [""])[0].toLowerCase();
    if (first) {
      firstWords.set(first, (firstWords.get(first) || 0) + 1);
      if (first === prevOpener) consecutive.push(t);
    }
    prevOpener = first || null;

    if (weakRes.some((re) => re.test(t))) weak.push(t);
    if (t.length > 240) long.push(t);
    if (t.length < 30) thin.push(t);
    if (/^[a-z]/.test(t) && !/^(https?:\/\/|www\.|[a-z0-9.-]+\.[a-z]{2,}(\/|:|\s))/i.test(t)) noVerb.push(t);
  }

  const repeats = [...firstWords].filter(([, n]) => n > REPEAT_LIMIT_DEFAULT).map(([w, n]) => `${w} (${n})`);
  if (repeats.length) f.push(finding(SEV.MAJOR, "repeated-openers", `the same opening verb starts more than ${REPEAT_LIMIT_DEFAULT} bullets: ${repeats.join(", ")}. Vary verbs; uniform openers read as generated.`));
  if (consecutive.length) f.push(finding(SEV.MAJOR, "consecutive-openers", "two consecutive bullets under the same role start with the same verb; vary openers.", consecutive));
  if (weak.length) f.push(finding(SEV.MAJOR, "weak-opener", "bullet opens with a filler or AI-cadence verb (spearheaded, leveraged, orchestrated, helped, worked on...). Use a plain specific verb.", weak));
  if (long.length) f.push(finding(SEV.MAJOR, "bullet-too-long", "bullet runs past two lines (~240 chars). Split or cut.", long));
  if (thin.length) f.push(finding(SEV.MINOR, "bullet-too-thin", "bullet under 30 characters carries no scope or outcome.", thin));
  if (noVerb.length) f.push(finding(SEV.MINOR, "bullet-lowercase-start", "bullet starts lowercase.", noVerb));

  let run = 0, maxRun = 0;
  for (const p of paragraphs) { run = p.isBullet ? run + 1 : 0; maxRun = Math.max(maxRun, run); }
  if (maxRun > 7) f.push(finding(SEV.MINOR, "bullet-run", `${maxRun} consecutive bullets under one header; cap around 6 for the lead role and 2-4 for older roles.`));

  const metrics = bullets.map((b) => b.text.trim()).filter((t) => METRIC_RE.test(t));
  if (metrics.length) f.push(finding(SEV.VERIFY, "quantified-claims", `${metrics.length} quantified claim(s). Each must trace to an evidence-ledger entry and survive "how did you measure that?"`, metrics));
  return f;
}

function checkContact(paragraphs, structure) {
  const f = [];
  const head = paragraphs.slice(0, 8).map((p) => p.text).join(" \n ");
  const all = paragraphs.map((p) => p.text).join("\n");
  const inHF = structure ? structure.headerFooterText.map((h) => h.text).join(" ") : "";

  if (!/[\w.+-]+@[\w-]+\.[\w.-]+/.test(all)) f.push(finding(SEV.BLOCKER, "no-email", "no email address in the body" + (/@/.test(inHF) ? " (only in header/footer)" : "") + "."));
  if (!hasPhoneNumber(all)) f.push(finding(SEV.MAJOR, "no-phone", "no phone number found."));
  if (!/linkedin\.com|github\.com|https?:\/\/|www\.|\.(com|io|dev|net|org|ai)\b/i.test(head)) f.push(finding(SEV.INFO, "no-link", "no LinkedIn or portfolio URL near the top (fine if the candidate asked for none)."));

  const cityRegionRe = new RegExp(`\\b[A-Z][a-zA-Z.'-]+(?:\\s+[A-Z][a-zA-Z.'-]+){0,2},\\s*(?:${REGION_CODES})\\b`);
  const hasLocation = cityRegionRe.test(head) || /\bremote\b/i.test(head) || COUNTRY_RE.test(head) || GLOBAL_CITIES_RE.test(head);
  if (!hasLocation) f.push(finding(SEV.MINOR, "no-location", "no city/state, country, or remote statement near the top; recruiters filter on location."));

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
  s = s.toLowerCase().replace(/\./g, "").trim();
  if (/^(?:present|current|now|today|ongoing)$/.test(s)) return { y: 9999, m: 12, kind: "present" };
  let m = s.match(/^(\d{1,2})\/((?:19|20)\d{2})$/);
  if (m) {
    const month = +m[1];
    if (month < 1 || month > 12) return null;
    return { y: +m[2], m: month, kind: "month" };
  }
  m = s.match(new RegExp(`^(${MONTHS})\\s+((?:19|20)\\d{2})$`, "i"));
  if (m) {
    const idx = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].findIndex((k) => m[1].startsWith(k));
    if (idx < 0) return null;
    return { y: +m[2], m: idx + 1, kind: "month" };
  }
  m = s.match(/^((?:19|20)\d{2})$/);
  if (m) return { y: +m[1], m: null, kind: "year" };
  return null;
}

function checkDates(paragraphs, opts) {
  const f = [];
  const headersByIdx = new Map(detectHeaders(paragraphs).map((h) => [h.index, h.kind]));
  const ranges = [];
  const seps = new Set();
  const presentWords = new Set();

  let inEducation = false;
  for (let i = 0; i < paragraphs.length; i++) {
    const kind = headersByIdx.get(i);
    if (kind === "education") inEducation = true;
    else if (kind && kind !== "other") inEducation = false;

    const line = paragraphs[i].text;
    const isExpectedGrad = inEducation || /\b(expected|anticipated|projected)\b/i.test(line);

    for (const m of line.matchAll(dateRangeRe())) {
      const a = parseDate(m[1]);
      const b = parseDate(m[2]);
      if (!a || !b) continue;
      ranges.push({ line, a, b, isExpectedGrad });
      const sepMatch = m[0].match(/\s*(-|–|—|to|through)\s*/i);
      if (sepMatch) {
        const sep = sepMatch[1].toLowerCase();
        seps.add(sep === "–" ? "en dash" : sep === "—" ? "em dash" : sep === "-" ? "hyphen" : sep);
      }
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
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;
  const isFutureDate = (d) => d.kind !== "present" && (d.y > curY || (d.y === curY && d.m && d.m > curM));
  const future = ranges.filter((r) => !r.isExpectedGrad && (isFutureDate(r.a) || isFutureDate(r.b)));
  if (future.length) f.push(finding(SEV.BLOCKER, "future-date", "a date is in the future; fix the typo.", future.map((r) => r.line)));

  const reversed = ranges.filter((r) => r.b.kind !== "present" && (r.b.y < r.a.y || (r.b.y === r.a.y && r.a.m && r.b.m && r.b.m < r.a.m)));
  if (reversed.length) f.push(finding(SEV.BLOCKER, "reversed-range", "end date precedes start date.", reversed.map((r) => r.line)));

  // Gap scan on the timeline (union of ranges), conservative thresholds.
  const toIdx = (d, end) => d.y * 12 + (d.m || (end ? 12 : 1));
  const sorted = ranges.filter((r) => r.a.y < 9999).map((r) => ({ s: toIdx(r.a, false), e: r.b.kind === "present" ? curY * 12 + curM : toIdx(r.b, true), line: r.line })).sort((x, y) => x.s - y.s);
  let reach = -Infinity; const gaps = [];
  for (const r of sorted) {
    if (reach !== -Infinity && r.s - reach > (kinds.has("month") ? 7 : 12)) gaps.push(`${Math.round((r.s - reach) / 12 * 10) / 10} yr gap before: ${r.line}`);
    reach = Math.max(reach, r.e);
  }
  if (gaps.length) f.push(finding(SEV.INFO, "timeline-gap", "gap on the timeline; add a neutral one-line label if it will be asked about (do not fudge dates).", gaps));

  // Reverse chronological within the experience block is expected; reading order should mostly descend.
  let ascendingPairs = 0;
  for (let i = 1; i < ranges.length; i++) if (toIdx(ranges[i].a, false) > toIdx(ranges[i - 1].a, false)) ascendingPairs++;
  if (ranges.length >= 3 && ascendingPairs > ranges.length / 2) f.push(finding(SEV.INFO, "chronology", "roles appear in ascending date order; reverse-chronological (or relevance-first with clear dates) is expected."));
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
// Phase 5 blinding
// ------------------------------------------------------------------

function blindResumeText(paragraphs) {
  const headers = detectHeaders(paragraphs);
  const firstSectionIdx = headers.find((h) => h.kind !== "other")?.index ?? Math.min(8, paragraphs.length);

  let replacedName = false;
  const out = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const trimmed = p.text.trim();

    if (!trimmed) {
      out.push("");
      continue;
    }

    // Replace candidate name header (skip an optional "Resume"/"CV" title line if it's on line 0).
    if (!replacedName && !p.isBullet && i < firstSectionIdx) {
      if (/^(resume|curriculum vitae|cv)$/i.test(trimmed)) continue;
      out.push("Candidate");
      replacedName = true;
      continue;
    }

    const hasEmail = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(trimmed);
    const hasPhone = hasPhoneNumber(trimmed);
    const hasSocial = /\b(?:linkedin\.com|github\.com)\b/i.test(trimmed);
    const hasStreet = /\b\d{2,5}\s+[A-Z][a-z]+\s+(St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Ln|Lane|Way|Ct)\b/i.test(trimmed);
    const hasUrl = /https?:\/\/|www\.|\.[a-z]{2,}\b/i.test(trimmed);

    // Strip contact lines in the header block (or email/phone/street contact lines anywhere).
    if (!p.isBullet && (hasEmail || hasPhone || hasStreet || (i < firstSectionIdx && (hasSocial || hasUrl)))) {
      continue;
    }

    out.push(p.isBullet ? "• " + p.text : p.text);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ------------------------------------------------------------------
// Evidence ledger provenance linter
// ------------------------------------------------------------------

function parseLedger(ledgerPath) {
  const raw = fs.readFileSync(ledgerPath, "utf8");
  const rows = new Map();
  let colMap = null;

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) {
      colMap = null;
      // Fallback for non-table lines: e.g. "- E1: fact ..." or "E1 | fact | ..."
      const plain = trimmed.match(/^(?:[-*]\s+)?(?:\*\*)?(E\d+)(?:\*\*)?[:\s]+(.+)$/i);
      if (plain) {
        const id = plain[1].toUpperCase();
        const body = plain[2];
        rows.set(id, {
          id,
          fact: body,
          kind: "",
          confidence: /\binferred\b/i.test(body) ? "inferred" : "stated",
          basis: /\bunmeasured\b/i.test(body) ? "unmeasured" : "",
        });
      }
      continue;
    }

    const cells = trimmed.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;

    if (cells.some((c) => /^id$/i.test(c))) {
      colMap = {};
      cells.forEach((c, idx) => { colMap[c.toLowerCase()] = idx; });
      continue;
    }

    const idIdx = colMap && colMap.id !== undefined ? colMap.id : 0;
    const idRaw = (cells[idIdx] || "").replace(/[\[\]*`]/g, "").trim();
    if (!/^E\d+$/i.test(idRaw)) continue;

    const id = idRaw.toUpperCase();
    const get = (name, fallbackIdx) => {
      const idx = colMap && colMap[name] !== undefined ? colMap[name] : fallbackIdx;
      return idx !== undefined && idx < cells.length ? cells[idx] : "";
    };
    rows.set(id, {
      id,
      fact: get("fact", 1),
      source: get("source", 2),
      kind: get("kind", colMap ? undefined : (cells.length >= 7 ? 4 : 3)).toLowerCase(),
      confidence: get("confidence", colMap ? undefined : (cells.length >= 7 ? 5 : 4)).toLowerCase(),
      basis: get("basis", colMap ? undefined : (cells.length >= 7 ? 6 : 5)),
    });
  }
  return rows;
}

function checkLedger(paragraphs, ledgerPath) {
  const f = [];
  const ledger = parseLedger(ledgerPath);
  const bullets = paragraphs.filter((p) => p.isBullet && p.text.trim());

  const unknownHits = [];
  const ungroundedHits = [];
  let citedBullets = 0;

  for (const b of bullets) {
    const t = b.text.trim();
    const citedIds = [];
    for (const m of t.matchAll(/\[([^\]]*?\bE\d+\b[^\]]*)\]/gi)) {
      for (const idMatch of m[1].matchAll(/\b(E\d+)\b/gi)) {
        citedIds.push(idMatch[1].toUpperCase());
      }
    }
    if (!citedIds.length) continue;
    citedBullets++;

    const unknown = citedIds.filter((id) => !ledger.has(id));
    if (unknown.length) {
      unknownHits.push(`${t} (unknown: ${unknown.join(", ")})`);
    }

    if (METRIC_RE.test(t)) {
      const badRows = citedIds
        .map((id) => ledger.get(id))
        .filter(Boolean)
        .filter((row) =>
          /\bunmeasured\b/i.test(row.basis) ||
          /^inferred\b/i.test(row.confidence) ||
          (row.kind === "metric" && !row.basis.trim())
        );
      if (badRows.length) {
        const reasons = badRows.map((r) => `${r.id}:${/\bunmeasured\b/i.test(r.basis) ? "unmeasured" : /^inferred\b/i.test(r.confidence) ? "inferred" : "missing-basis"}`);
        ungroundedHits.push(`${t} (${reasons.join(", ")})`);
      }
    }
  }

  if (unknownHits.length) {
    f.push(finding(SEV.BLOCKER, "ledger-unknown-id", "bullet cites evidence-ledger ID(s) missing from ledger.", unknownHits));
  }
  if (ungroundedHits.length) {
    f.push(finding(SEV.MAJOR, "ledger-ungrounded-metric", "quantified bullet cites an unmeasured or inferred ledger row; remove the number or record its measurement basis.", ungroundedHits));
  }
  f.push(finding(SEV.INFO, "ledger-coverage", `parsed ${ledger.size} ledger row(s); checked ${citedBullets} bullet(s) with [E#] citations.`));
  return f;
}

// ------------------------------------------------------------------
// Pages
// ------------------------------------------------------------------

function estimatePages(paragraphs, structure) {
  const bodyPt = (() => {
    const sizes = paragraphs.flatMap((p) => p.sizes).filter((s) => s >= 8 && s <= 13); // body-text range only
    if (!sizes.length) return 11;
    const counts = new Map(); for (const s of sizes) counts.set(s, (counts.get(s) || 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1])[0][0];
  })();
  const pw = structure && structure.pageSize ? structure.pageSize.widthIn : 8.5;
  const ph = structure && structure.pageSize ? structure.pageSize.heightIn : 11;
  const m = structure && structure.marginsIn ? structure.marginsIn : { top: 1, right: 1, bottom: 1, left: 1 };
  const textW = pw - m.left - m.right;
  const textH = ph - m.top - m.bottom;
  // Calibrated against LibreOffice renders of the bundled template: ~16 chars per inch at 10pt
  // (Calibri-class fonts), and ~1.7x the font size per rendered line once paragraph spacing,
  // section-header spacing, and bullet gaps are averaged in.
  const charsPerLine = Math.floor(textW * (160 / bodyPt));
  const lineHeightIn = (bodyPt * 1.7) / 72;
  const linesPerPage = Math.floor(textH / lineHeightIn);
  let lines = 0;
  for (const p of paragraphs) {
    const t = p.text.trim();
    if (!t) { lines += 0.5; continue; }
    const width = p.isBullet ? charsPerLine - 4 : charsPerLine;
    lines += Math.max(1, Math.ceil(t.length / width));
  }
  const value = Math.max(1, Math.ceil(lines / linesPerPage));
  const fill = (lines % linesPerPage) / linesPerPage;
  const nearLimit = value === Math.ceil(lines / linesPerPage) && (fill > 0.9 || fill < 0.1) && lines > linesPerPage * 0.5;
  return { value, method: "estimate", lines: Math.round(lines), linesPerPage, nearLimit };
}

function measurePages(file, opts) {
  if (opts.pdf) {
    const pages = pdfPageCount(opts.pdf);
    return pages ? { value: pages, method: "libreoffice" } : { error: "could not count pages in the rendered pdf" };
  }
  if (opts.noRender || !/\.docx$/i.test(file)) return null;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-check-pdf-"));
  try {
    const r = renderPdf(file, tmpDir, 15000);
    if (r.error) return { error: r.error };
    const pages = pdfPageCount(r.pdf);
    return pages ? { value: pages, method: "libreoffice" } : { error: "could not count pages in the rendered pdf" };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
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

const USAGE = [
  "usage: node resume-check.js <resume.docx|.txt|.md> [options]",
  "",
  "options:",
  "  --jd <file>              job description text; enables keyword coverage",
  "  --must \"a,b,c\"           terms that must appear (hard requirements); MAJOR if absent",
  "  --target-pages <n>       page budget (default 2; use 1 for new grads)",
  "  --profile <name>         standard (default) | federal",
  "  --paper <letter|a4|any>  expected paper size (default letter)",
  "  --text <out.txt>         also write the ATS-extracted plain text",
  "  --blind <out.txt>        write a Phase 5 blinded plain-text copy",
  "  --ledger <path>          lint [E#] bullet citations against ledger.md",
  "  --pdf <file.pdf>         use a pre-rendered PDF for exact page count",
  "  --json                   machine-readable report on stdout",
  "  --strict                 MAJOR findings also fail the run",
  "  --no-render              skip the LibreOffice page count (estimate only)",
  "  --help, -h               show this help",
].join("\n");

function parseArgs(argv) {
  const opts = {
    file: null, jd: null, must: [], targetPages: 2, profile: "standard",
    paper: "letter", text: null, blind: null, ledger: null, pdf: null,
    json: false, strict: false, noRender: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length || argv[i + 1].startsWith("--")) {
        console.error(`missing value for ${a}`);
        process.exit(2);
      }
      return argv[++i];
    };
    if (a === "--help" || a === "-h") {
      console.log(USAGE);
      process.exit(0);
    } else if (a === "--jd") opts.jd = next();
    else if (a === "--must") opts.must = next().split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--target-pages") {
      const n = Number(next());
      if (!Number.isInteger(n) || n < 1) {
        console.error("invalid --target-pages: expected a positive integer");
        process.exit(2);
      }
      opts.targetPages = n;
    } else if (a === "--profile") {
      opts.profile = next();
      if (!["standard", "federal"].includes(opts.profile)) {
        console.error(`invalid --profile "${opts.profile}": expected standard or federal`);
        process.exit(2);
      }
    } else if (a === "--paper") {
      opts.paper = next();
      if (!["letter", "a4", "any"].includes(opts.paper)) {
        console.error(`invalid --paper "${opts.paper}": expected letter, a4, or any`);
        process.exit(2);
      }
    } else if (a === "--text") opts.text = next();
    else if (a === "--blind") opts.blind = next();
    else if (a === "--ledger") opts.ledger = next();
    else if (a === "--pdf") opts.pdf = next();
    else if (a === "--json") opts.json = true;
    else if (a === "--strict") opts.strict = true;
    else if (a === "--no-render") opts.noRender = true;
    else if (a.startsWith("-")) { console.error(`unknown option ${a}`); process.exit(2); }
    else opts.file = a;
  }
  if (!opts.file) {
    console.error(USAGE);
    process.exit(2);
  }
  if (opts.profile === "federal") opts.targetPages = Math.min(opts.targetPages, 2);
  return opts;
}

function run(opts) {
  const { text, paragraphs, structure } = readAny(opts.file);
  if (opts.text) {
    fs.mkdirSync(path.dirname(path.resolve(opts.text)), { recursive: true });
    fs.writeFileSync(opts.text, text + "\n");
  }
  if (opts.blind) {
    fs.mkdirSync(path.dirname(path.resolve(opts.blind)), { recursive: true });
    fs.writeFileSync(opts.blind, blindResumeText(paragraphs) + "\n");
  }

  const findings = [
    ...checkStructure(structure, opts),
    ...checkHygiene(paragraphs, text),
    ...checkBullets(paragraphs),
    ...checkContact(paragraphs, structure),
    ...checkSections(paragraphs, opts),
    ...checkDates(paragraphs, opts),
  ];
  if (opts.profile === "federal") findings.push(...checkFederal(text));
  if (opts.ledger) findings.push(...checkLedger(paragraphs, opts.ledger));

  const measured = measurePages(opts.file, opts);
  const pages = measured && measured.value ? measured : estimatePages(paragraphs, structure);
  if (measured && measured.error) pages.note = `LibreOffice ${measured.error}; estimate used`;
  else if (pages.method === "estimate") pages.note = opts.noRender ? "render skipped" : "install LibreOffice for an exact count";
  if (pages.method === "estimate" && pages.nearLimit) pages.note += "; close to a page boundary, verify the real count before submitting";
  const pageNote = pages.note ? `; ${pages.note}` : "";
  if (pages.value > opts.targetPages) findings.push(finding(pages.method === "estimate" ? SEV.MAJOR : SEV.BLOCKER, "page-budget", `${pages.value} page(s) (${pages.method}${pageNote}) against a budget of ${opts.targetPages}. Tighten: compress older roles, cut the weakest bullets, merge skill lines.`));
  else findings.push(finding(SEV.INFO, "page-budget", `${pages.value} page(s) (${pages.method}${pageNote}), budget ${opts.targetPages}.`));

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
  process.exitCode = report.failed ? 1 : 0; // not process.exit(): piped stdout is async on macOS and would truncate
}

module.exports = { run, parseArgs, blindResumeText, parseLedger, hasPhoneNumber };
