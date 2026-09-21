# resume-screener-loop

An agent skill that tailors a resume to a specific job, then attacks the draft the way the company's screening pipeline will, and revises until it survives. Works in any coding agent that reads `SKILL.md` (Claude Code, Codex CLI, Gemini CLI, Cursor, Copilot CLI, OpenCode, and others).

Most tailoring tools keyword-match against the JD and hand back a score. Real pipelines do something else: a parser extracts text, knockout questions filter, a recruiter scans for seven seconds, a hiring manager reads for depth, and an interviewer asks "how did you measure that?" This skill simulates each of those readers, and it refuses to write anything it cannot trace to the candidate's own evidence.

## What it produces

Given a candidate's material (resume, LinkedIn, portfolio, repositories, certificates) and a job (pasted JD, URL, or title plus company):

1. **Evidence ledger**: every fact from the sources, with provenance and, for numbers, the measurement basis. Bullets are written only from ledger rows; missing facts become questions for the candidate.
2. **Requirements matrix and fit tier**: the JD decomposed into hard filters, soft preferences, responsibilities, and culture signals, each bound to evidence with a status. The fit tier follows from the matrix by rule, and the candidate hears it before any drafting.
3. **ATS-safe DOCX plus plain text**, built with docx-js: US Letter, one column, standard sections, no tables or images or headers.
4. **Mechanical gate**: `scripts/resume-check.js` extracts the text as a parser would and fails on layout hazards, hidden text, banned phrasing, AI-cadence openers, date problems, missing hard-requirement terms, and page budget. Zero dependencies.
5. **Three-reader screen** on a blinded copy: recruiter scan, in-character hiring-manager deep read (run twice; only reproducible findings count), and a skeptic pass against the ledger.
6. **Convergence**: revise, re-gate, re-screen, stop when the readers forward it or after three rounds, with a round log.
7. **Cover note**: fit tier and matrix summary, what changed, residual risks, open questions, and interview probes with ledger-backed answers.

## Hard rules

No em dashes. No number without a recorded measurement basis. No marketing tone or generated cadence. No overclaimed skills. No hidden, white, or tiny text, and no text addressed to an AI reader, even if asked. Honest fit tier before drafting. Blinded critique. Every bullet traces to evidence. Full list in [`SKILL.md`](SKILL.md) and [`reference/anti-patterns.md`](reference/anti-patterns.md).

## Install

Clone once, then link into every agent you use:

```bash
git clone https://github.com/flowmar47/resume-screener-loop.git
cd resume-screener-loop
./install.sh            # symlinks into each agent skills dir that exists (~/.claude/skills, ~/.codex/skills, ~/.gemini/skills, ~/.cursor/skills, ~/.copilot/skills, ~/.config/opencode/skills, ~/.agents/skills, and others)
./install.sh --list     # show what would be linked
./install.sh --copy     # copy instead of symlink
```

Or with the skills CLI, which discovers the root `SKILL.md`:

```bash
npx skills add flowmar47/resume-screener-loop
```

Or copy the directory into one agent's skills folder by hand. The `SKILL.md` frontmatter follows the open Agent Skills specification, so any compliant agent picks it up.

Runtime needs: Node 18+ (the checker has no dependencies; the DOCX builder needs `npm install docx` in your working directory), a web fetch or search tool or `curl`, and optionally LibreOffice for exact page counts.

## Use

In your agent, ask for what you want in plain words:

> Tailor my resume for the Senior Backend Engineer role at Acme (JD pasted below). Here is my current resume and my LinkedIn.

> Would a recruiter pass this? Screen it as OpenAI would for the AI Deployment Engineer role.

> Is this resume ATS-safe? Check it against this posting.

The skill asks for missing material, reports the fit tier with its gaps and questions, and then runs the loop. It never submits anything on your behalf.

## Run the checker on its own

```bash
node scripts/resume-check.js Resume.docx --jd jd.txt --must "Python,Kubernetes" --text Resume.txt
node scripts/resume-check.js Resume.docx --profile federal        # OPM two-page rule, MM/YYYY dates, hours per week
node scripts/resume-check.js resume.md --target-pages 1           # new grad
node scripts/docx-text.js Resume.docx                             # what a parser sees
```

Exit code 0 means no blockers. The keyword section is a diagnostic list for judgment, not a score; no employer system publishes one.

## Repository layout

```
SKILL.md                      entry point any agent reads
install.sh                    link the skill into every agent found on the machine
scripts/
  resume-check.js             mechanical gate (structure, style, dates, pages, keywords)
  docx-text.js                zero-dependency DOCX text and structure extractor
reference/
  workflow.md                 the loop in detail
  evidence-ledger.md          provenance format and rules
  requirements-matrix.md      JD decomposition, fit-tier rules, keyword decisions
  screener-critique.md        three readers, rubric, blinding, convergence
  screener-personas.md        company and segment archetypes for the hiring-manager read
  anti-patterns.md            banned phrasing and substitutions
  ats-mechanics.md            what ATS vendors document, with sources
  industry-trends.md          what changed recently, source-tagged
  jd-acquisition.md           fetching and decomposing the JD
  profile-ingestion.md        reading the candidate's material
  agent-tooling.md            tool mapping per agent and fallbacks
templates/
  lib.js                      docx-js helpers (Letter, single column, ATS-safe)
  content-template.js         shared content module pattern
  resume-template.js          per-target builder
  README.md                   build pipeline
examples/walkthrough.md       one full loop on a fictional candidate, with real checker output
CHANGELOG.md
```

## Why the extra machinery

Two findings drove the redesign. First, models writing resumes invent plausible bullets; a provenance ledger turns "do not fabricate" into a check. Second, a single model critic is not a reliable judge: controlled studies show verdicts shifting with phrasing and with the name on the page. Multiple readers with distinct jobs, a fixed rubric, evidence grounding, blinding, and a repeat-run filter are the mitigations with evidence behind them. Sources are cited in `reference/ats-mechanics.md` and `reference/industry-trends.md`.

## Contributing

Welcome: new personas, corrections to `ats-mechanics.md` with a primary source, checker rules with a test case, template improvements. Please keep examples fictional. Run the checker on any sample resume you add; it should pass.

## License

MIT. See [`LICENSE`](LICENSE).
