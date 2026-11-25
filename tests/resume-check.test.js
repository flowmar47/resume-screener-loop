"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { run, blindResumeText, parseLedger } = require("../scripts/resume-check");
const CHECKER = path.join(__dirname, "..", "scripts", "resume-check.js");

function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-check-test-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function baseResume(overrides = {}) {
  const lines = [
    "# Avery Lin",
    overrides.contact || "London, UK | avery@example.com | +44 20 7946 0958 | linkedin.com/in/averylin",
    "",
    "## Professional Summary",
    overrides.summary || "Backend engineer with six years building reliable ingestion pipelines and production APIs.",
    "",
    "## Experience",
    overrides.role1 || "**Senior Software Engineer | Acme Payments | Jan 2022 – Present**",
    ...(overrides.role1Bullets || [
      "- Built nightly reconciliation service in Go and PostgreSQL across four payment providers.",
      "- Migrated batch jobs to event-driven workers with structured dead-letter replay.",
    ]),
    "",
    overrides.role2 || "**Software Engineer I | Northstar Data | Mar 2019 To Dec 2021**",
    ...(overrides.role2Bullets || [
      "- Designed streaming ingestion endpoints for high I/O workloads and monitored SLAs.",
      "- Maintained CMake and Ninja build pipelines for Linux deployment images.",
    ]),
    "",
    "## Selected Technical Skills",
    overrides.skills || "Languages: Python, Go, SQL | Infrastructure: Docker, PostgreSQL, CMake, Ninja",
    "",
    "## Education",
    overrides.edu || "**State University | B.S. Computer Science | Aug 2015 – May 2019**",
  ];
  return lines.join("\n");
}

function checkText(dir, filename, content, extraOpts = {}) {
  const p = path.join(dir, filename);
  fs.writeFileSync(p, content);
  return run({
    file: p,
    jd: null,
    must: [],
    targetPages: 2,
    profile: "standard",
    paper: "letter",
    text: null,
    blind: null,
    ledger: null,
    pdf: null,
    json: false,
    strict: false,
    noRender: true,
    ...extraOpts,
  });
}

function rulesOf(report) {
  return new Map(report.findings.map((f) => [f.rule, f]));
}

test("clean Markdown resume passes with 0 blockers and 0 majors", () => {
  withTempDir((dir) => {
    const r = checkText(dir, "clean.md", baseResume());
    assert.equal(r.counts.BLOCKER || 0, 0, JSON.stringify(r.findings, null, 2));
    assert.equal(r.counts.MAJOR || 0, 0, JSON.stringify(r.findings, null, 2));
    assert.equal(r.failed, false);
  });
});

test("date checks handle To separator, reject invalid numeric months, ignore Market 2024, allow Education future grad, and catch future start month", () => {
  withTempDir((dir) => {
    // 1. Capitalized "To" separator does not crash, and Education "May 2027" does not trigger future-date
    const eduFuture = checkText(dir, "edu.md", baseResume({
      edu: "**State University | B.S. Computer Science | Aug 2023 – May 2027**",
    }));
    assert.equal(rulesOf(eduFuture).has("future-date"), false);

    // 2. "Market 2024" is not misparsed as March 2024 (so "Market 2024 – Jan 2024" is not reversed, while "Mar 2024 – Jan 2024" is)
    const market = checkText(dir, "market.md", baseResume({
      summary: "Delivered Market 2024 – Jan 2024 pricing dataset ingestion for retail partners.",
    }));
    assert.equal(rulesOf(market).has("reversed-range"), false);

    const marchReversed = checkText(dir, "march-reversed.md", baseResume({
      summary: "Delivered Mar 2024 – Jan 2024 pricing dataset ingestion for retail partners.",
    }));
    assert.equal(rulesOf(marchReversed).get("reversed-range")?.severity, "BLOCKER");

    // 3. Invalid month 13/2023 is ignored rather than treated as month 13
    const invalidMonth = checkText(dir, "invalid-month.md", baseResume({
      role1: "**Senior Software Engineer | Acme Payments | 13/2023 – Present**",
    }));
    assert.equal(rulesOf(invalidMonth).has("future-date"), false);

    // 4. Future start month outside Education triggers BLOCKER [future-date]
    const nextYear = new Date().getFullYear() + 1;
    const futureRole = checkText(dir, "future-role.md", baseResume({
      role1: `**Senior Software Engineer | Acme Payments | Jan ${nextYear} – Present**`,
    }));
    assert.equal(rulesOf(futureRole).get("future-date")?.severity, "BLOCKER");

    // 5. Same-year future start month outside Education (when not December) triggers BLOCKER
    const now = new Date();
    if (now.getMonth() + 1 < 12) {
      const sameYearFuture = checkText(dir, "same-year-future.md", baseResume({
        role1: `**Senior Software Engineer | Acme Payments | Dec ${now.getFullYear()} – Present**`,
      }));
      assert.equal(rulesOf(sameYearFuture).get("future-date")?.severity, "BLOCKER");
    }
  });
});

test("contact checks distinguish real phone numbers from year ranges and handle international locations vs skill pairs", () => {
  withTempDir((dir) => {
    // Resume with "2019 - 2020" and NO phone must flag no-phone
    const noPhone = checkText(dir, "nophone.md", baseResume({
      contact: "Berlin, Germany | avery@example.com",
      role2: "**Software Engineer | Northstar | 2019 - 2020**",
    }));
    assert.equal(rulesOf(noPhone).get("no-phone")?.severity, "MAJOR");
    assert.equal(rulesOf(noPhone).has("no-location"), false);

    // Skill pair "Python, ML" must NOT satisfy location
    const skillPairOnly = checkText(dir, "skillpair.md", baseResume({
      contact: "Python, ML | avery@example.com | (555) 555-0100",
    }));
    assert.equal(rulesOf(skillPairOnly).get("no-location")?.severity, "MINOR");
  });
});

test("style checks catch sentence-initial pronouns while exempting I/O, about.me, and Roman-numeral titles", () => {
  withTempDir((dir) => {
    const clean = checkText(dir, "exempt.md", baseResume({
      contact: "Toronto, Canada | avery@example.com | (555) 555-0100 | about.me/avery",
      role2: "**Financial Analyst I | Northstar Data | Mar 2019 – Dec 2021**",
      role2Bullets: [
        "- Optimized high I/O batch queries across read replicas.",
        "- Supported Phase I clinical trial reporting tools.",
      ],
    }));
    assert.equal(rulesOf(clean).has("first-person"), false);

    for (const badLine of [
      "- We built a distributed ingestion pipeline.",
      "- Our team reduced latency across services.",
      "- My responsibility covered release verification.",
      "- Me and the platform group shipped v2.",
    ]) {
      const bad = checkText(dir, "pronoun.md", baseResume({ role1Bullets: [badLine] }));
      assert.equal(rulesOf(bad).get("first-person")?.severity, "MAJOR", `expected pronoun flag for: ${badLine}`);
    }
  });
});

test("banned phrase checks avoid false positives on Ninja/Evangelist/setup wizard/Gurugram while catching clichés", () => {
  withTempDir((dir) => {
    const clean = checkText(dir, "techterms.md", baseResume({
      contact: "Gurugram, India | avery@example.com | +91 98 7654 3210",
      role1: "**Developer Evangelist | Acme Tools | Jan 2022 – Present**",
      role1Bullets: [
        "- Built an interactive setup wizard for customer onboarding.",
        "- Maintained CMake and Ninja builds across Linux and macOS.",
      ],
    }));
    assert.equal(rulesOf(clean).has("banned-phrase"), false);

    for (const cliché of [
      "- Operated as a code ninja for backend services.",
      "- Known as an Excel wizard across finance operations.",
      "- Recognized thought leader driving cross-team synergy.",
    ]) {
      const bad = checkText(dir, "cliche.md", baseResume({ role1Bullets: [cliché] }));
      assert.equal(rulesOf(bad).get("banned-phrase")?.severity, "BLOCKER", `expected banned-phrase for: ${cliché}`);
    }
  });
});

test("checkBullets detects consecutive identical openers under the same role only", () => {
  withTempDir((dir) => {
    const sameRoleConsecutive = checkText(dir, "consec.md", baseResume({
      role1Bullets: [
        "- Built nightly settlement service in Go.",
        "- Built internal admin dashboard in TypeScript.",
      ],
    }));
    assert.equal(rulesOf(sameRoleConsecutive).get("consecutive-openers")?.severity, "MAJOR");

    const differentRoles = checkText(dir, "diffroles.md", baseResume({
      role1Bullets: [
        "- Built nightly settlement service in Go.",
        "- Migrated legacy cron jobs to event workers.",
      ],
      role2Bullets: [
        "- Built ingestion connectors for three banking APIs.",
        "- Automated integration tests in CI.",
      ],
    }));
    assert.equal(rulesOf(differentRoles).has("consecutive-openers"), false);
  });
});

test("--blind writes blinded copy with Candidate header and stripped contact lines", () => {
  withTempDir((dir) => {
    const blindPath = path.join(dir, "out", "blinded.txt");
    checkText(dir, "resume.md", baseResume({
      contact: [
        "123 Main Street, Austin, TX 78701",
        "avery@example.com | (555) 555-0100",
        "linkedin.com/in/averylin | github.com/averylin",
      ].join("\n"),
    }), { blind: blindPath });

    const blinded = fs.readFileSync(blindPath, "utf8");
    assert.match(blinded, /^Candidate\b/);
    assert.doesNotMatch(blinded, /Avery Lin/);
    assert.doesNotMatch(blinded, /avery@example\.com/);
    assert.doesNotMatch(blinded, /555-0100/);
    assert.doesNotMatch(blinded, /linkedin\.com/);
    assert.doesNotMatch(blinded, /123 Main Street/);
    assert.match(blinded, /Senior Software Engineer/);
    assert.match(blinded, /State University/);
  });
});

test("--ledger validates [E#] citations, flags unknown IDs as BLOCKER and unmeasured/inferred metrics as MAJOR", () => {
  withTempDir((dir) => {
    const ledgerPath = path.join(dir, "ledger.md");
    fs.writeFileSync(ledgerPath, [
      "| id | fact | source | locator | kind | confidence | basis |",
      "|---|---|---|---|---|---|---|",
      "| E1 | Built Go reconciliation service across 4 providers | repo README | Architecture | project | observed | counted providers in config |",
      "| E2 | Cut deploy time by 60% | old resume | role 1 | metric | stated | unmeasured: no baseline |",
      "| E3 | Estimated 3x throughput gain | notes | chat | metric | inferred | extrapolated from test |",
    ].join("\n"));

    const parsed = parseLedger(ledgerPath);
    assert.equal(parsed.size, 3);

    const good = checkText(dir, "good-ledger.md", baseResume({
      role1Bullets: [
        "- Built nightly reconciliation service across 4 providers in Go [E1].",
        "- Migrated batch jobs to event-driven workers with dead-letter replay [E1].",
      ],
    }), { ledger: ledgerPath });
    assert.equal(rulesOf(good).has("ledger-unknown-id"), false);
    assert.equal(rulesOf(good).has("ledger-ungrounded-metric"), false);

    const bad = checkText(dir, "bad-ledger.md", baseResume({
      role1Bullets: [
        "- Cut deploy time by 60% across CI pipelines [E2].",
        "- Delivered 3x throughput gain on ingestion workers [E3].",
        "- Shipped zero-downtime migration [E99].",
      ],
    }), { ledger: ledgerPath });
    assert.equal(rulesOf(bad).get("ledger-unknown-id")?.severity, "BLOCKER");
    assert.equal(rulesOf(bad).get("ledger-ungrounded-metric")?.severity, "MAJOR");
  });
});

test("CLI validates --help, --target-pages, --profile, --paper, and missing flag values", () => {
  const helpRes = spawnSync(process.execPath, [CHECKER, "--help"], { encoding: "utf8" });
  assert.equal(helpRes.status, 0);
  assert.match(helpRes.stdout, /--blind/);
  assert.match(helpRes.stdout, /--ledger/);

  for (const badArgs of [
    ["resume.md", "--target-pages", "0"],
    ["resume.md", "--target-pages", "abc"],
    ["resume.md", "--profile", "invalid"],
    ["resume.md", "--paper", "tabloid"],
    ["resume.md", "--jd"],
  ]) {
    const res = spawnSync(process.execPath, [CHECKER, ...badArgs], { encoding: "utf8" });
    assert.equal(res.status, 2, `expected exit 2 for ${badArgs.join(" ")}`);
  }
});
