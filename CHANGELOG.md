# Changelog

## 2.0.0 (2026-09-21)

The loop was rebuilt around two problems the first version did not solve: a model can write a plausible bullet the candidate never did, and a single in-character critic is not a reliable judge.

**Added**

- Evidence ledger (`reference/evidence-ledger.md`): every resume claim traces to a sourced row; unmeasured numbers never reach the page; missing facts become a batched question list for the candidate.
- Requirements matrix (`reference/requirements-matrix.md`): atomic JD rows bound to evidence with a status; the fit tier is computed from the matrix by rule instead of eyeballed.
- Mechanical gate (`scripts/resume-check.js`, `scripts/docx-text.js`): zero-dependency Node checker that extracts text the way a parser does and fails on multi-column layouts, tables, text boxes, header/footer contact info, hidden or white or tiny text, prompt-injection text, em dashes, banned phrasing, AI-cadence openers, repeated openers, first person, missing sections, date problems, page budget, and missing hard-requirement terms. Reports JD terms not found as a diagnostic, never as a score. Handles DOCX, Markdown, and plain text; measures pages with LibreOffice when present, estimates otherwise. Federal profile encodes OPM's 2025 two-page rule.
- Three-reader screen (`reference/screener-critique.md`): recruiter 7-second scan, hiring-manager deep read run twice with a repeat-run filter, and a skeptic pass against the ledger; a fixed rubric (fit, credibility, clarity, parse, style) with severities; blinded copy; convergence rules and a three-round cap.
- Deliverables: plain-text version for paste-in forms, interview probes with ledger-backed answers, round log in the cover note.
- `reference/ats-mechanics.md`: what ATS vendors document (no auto-reject on match score; knockout questions do reject; parser map; what still breaks parsing; LLM screening; injection detection; USAJOBS after 2025), with sources.
- `reference/agent-tooling.md` and `install.sh`: the skill is agent-agnostic; the installer links it into every agent skills directory found on the machine.
- Personas for healthcare, finance and consulting, US federal, academic, and executive search; segment gates for sales, clinical, federal, executive, new grad, career changer, and international norms.

**Changed**

- All instructions are written for any agent (no product-specific tool names in the workflow).
- Templates default to US Letter (docx-js defaults to A4; the previous README claimed Letter), gained a `headline()` helper, and carry ledger ids as comments on bullets.
- `industry-trends.md` rewritten with source tags; corrected the ResumeGo study year (2018) and removed statistics that trace only to advice blogs.
- Walkthrough rewritten to show the full loop with real checker output.

**Removed**

- Global `npm install docx --global` and `NODE_PATH` instructions; install locally in the working directory.

## 1.0.0

Initial release: four-phase loop (ingest and fit, draft, single in-character screener critique, revision) with docx-js templates.
