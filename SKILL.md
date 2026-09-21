---
name: resume-screener-loop
description: Tailor a resume to a specific job, then critique it the way the company's screeners will (ATS parse, recruiter scan, hiring-manager read, fact-check) and revise until it survives. Every bullet traces to evidence; nothing is invented. Use when the user asks to tailor, customize, rewrite, or stress-test a resume or CV for a role, company, or job description, or asks "would a recruiter pass this", "is this ATS-safe", "screen my resume", "apply for [role] at [company]". Accepts any profile inputs (existing resume, LinkedIn, portfolio, READMEs, code, certificates) and any job spec (pasted JD, URL, or title plus company to look up). Produces an evidence ledger, a requirements matrix with an honest fit tier, a checker-verified ATS-safe DOCX plus plain text, and a cover note with interview-probe answers. Works in any agent that can read files, run Node, and fetch URLs.
license: MIT
compatibility: Any coding agent with file access and a shell. Node 18+ for the DOCX builder and checker (no npm packages beyond docx for building). Web fetch or search tool recommended; otherwise ask the user to paste the JD. LibreOffice optional for exact page counts.
metadata:
  author: flowmar47
  version: "2.0.0"
  homepage: https://github.com/flowmar47/resume-screener-loop
---

# Resume Screener Loop

You are tailoring one candidate's resume to one job, then attacking your own draft the way the company's screening pipeline will, then fixing what breaks. The loop ends when the draft survives every reader, or when you can say precisely why it will not.

Two invariants hold throughout:

1. **Provenance.** Every claim on the resume traces to a row in the evidence ledger built from the candidate's own material. No ledger row, no bullet. A missing fact becomes a question for the candidate, never a guess.
2. **Honesty before optimization.** The fit tier is computed from the requirements matrix before any drafting. If the fit is weak, the candidate hears that first and decides whether to proceed.

## When to use

Tailoring one resume to one job description; batch tailoring for several roles; a pure screening pass on an existing draft; ATS-safety review of a resume the candidate already has. Not for: cover letters, LinkedIn rewrites, generic resume writing with no target role, or file conversion alone.

## Inputs

Gather both halves before starting. Read `reference/profile-ingestion.md` and `reference/jd-acquisition.md` when inputs are thin or need fetching.

- **Profile**: existing resume (any format), LinkedIn or other profile page, portfolio or company site, project READMEs or repositories, code or document samples, certificates, transcripts, and the candidate's stated preferences (things to omit, tone, location, remote/on-site, page budget).
- **Job**: pasted JD text, a JD URL, or title plus company. With only a title, ask which company. Never invent a JD.
- **Market segment**: standard US/UK-style resume (default), US federal (two-page cap, MM/YYYY dates, hours per week), academic CV, or another national norm. Ask if the JD does not make it obvious.

Tool names differ by agent. Use whatever you have for fetching URLs, searching the web, reading files, and running shell commands; `reference/agent-tooling.md` maps common agents and gives a `curl` fallback.

## The loop

```
0 Intake → 1 Evidence ledger → 2 Requirements matrix + fit tier → [candidate decides]
        → 3 Draft → 4 Mechanical gate (scripts/resume-check.js)
        → 5 Three-reader screen (recruiter scan, hiring-manager read, skeptic)
        → 6 Revise → back to 4 until converged (max 3 rounds)
        → 7 Deliver (DOCX + plain text + cover note + interview probes)
```

### Phase 1: Evidence ledger

Read every profile source completely. Write a ledger with one row per fact: id, the fact as stated, source and locator, kind (role, project, metric, credential, skill, artifact, constraint), and confidence (candidate-stated, observed in an artifact, or inferred). Numbers enter the ledger with their measurement basis or are marked unmeasured; unmeasured numbers never reach the resume. Format and rules: `reference/evidence-ledger.md`.

Facts you wish you had go into a **questions list** for the candidate. Batch them; ask once, at the fit-tier checkpoint, not one at a time.

### Phase 2: Requirements matrix and fit tier

Decompose the JD into atomic requirements: id, text, type (hard filter, soft preference, responsibility, culture signal), and weight. Bind each to the ledger rows that satisfy it and mark its status: met, partial, adjacent, gap, or ask. Derive the fit tier from the matrix by the rules in `reference/requirements-matrix.md` (a single unmet hard filter with no defensible substitute caps the tier at weak).

Report the tier, the gaps, and the questions list to the candidate before drafting. Proceed on weak or very weak fit only if they say so.

### Phase 3: Draft

Build from the matrix, not from the old resume. Rules that matter most:

- Lead with the most relevant role and put the strongest scope claim in its first bullet. Current title, company, and dates must be readable in the top third of page one.
- Mirror the JD's wording where the ledger genuinely supports it; carry a key acronym and its expansion once each. Never add a term the candidate cannot defend in an interview.
- One column, standard section names, real bullets, no tables, text boxes, images, headers, or footers. Body 10-12pt, margins 0.5-1 inch, Letter for US employers.
- Two pages for experienced candidates, one for new grads, two hard for US federal. Older roles compress to two to four bullets.
- Segment gates: sales roles show quota attainment per role; clinical roles put credentials after the name and license under contact; finance and consulting show GPA when 3.5 or above; federal roles show hours per week and MM/YYYY dates.
- Apply `reference/anti-patterns.md` while writing, not after.

Generate the DOCX with `templates/` (Node plus the `docx` package; see `templates/README.md`). If Node is unavailable, write Markdown with the same section names and convert with pandoc; the checker accepts `.md` and `.txt` too.

### Phase 4: Mechanical gate

Run the checker on every draft before any human-style critique:

```bash
node scripts/resume-check.js out/Resume.docx --jd jd.txt --must "Python,Kubernetes,Secret clearance" --text out/Resume.txt
```

Pass `--must` with the hard-filter terms from the matrix, `--target-pages 1` for new grads, `--profile federal` for USAJOBS. Fix every BLOCKER and MAJOR. Work the VERIFY lists: each quantified claim maps to a ledger row; each missing JD term is classified as a genuine gap (goes in the fit note), a wording mismatch (use the JD's term once), or irrelevant. The checker is a diagnostic, not an ATS score; no employer system publishes one.

### Phase 5: Three-reader screen

Screen a **blinded copy** (name and contact replaced with "Candidate") so nothing in the verdict rides on demographic or prestige cues. Three readers, each with a fixed rubric (`reference/screener-critique.md`):

- **Reader A, recruiter, 7-second scan**: reads only what a first pass sees: title, company, dates, years, location, clearance, the skills block. Answers the ATS knockout questions. Verdict: forward, hold, pass.
- **Reader B, hiring manager, deep read**: in character for the company archetype (`reference/screener-personas.md`). Judges depth, scope versus level, credibility, and mission fit. States what would change their mind.
- **Reader C, skeptic**: challenges every claim against the ledger ("how did you measure that?"), checks title and date consistency with LinkedIn, and flags overclaims and AI-cadence tells.

Findings carry severity (blocker, major, minor), axis (fit, credibility, clarity, parse, style), the offending line, and the concrete fix. Run Reader B twice; keep only findings that recur or are objectively checkable. Taste that does not reproduce is noise.

### Phase 6: Revise and converge

Apply the findings, rebuild, rerun Phase 4, and re-screen. Keep a round log: what each round fixed and what remains. Stop when no blocker or major findings remain, Reader A says forward, Reader B says forward or forward-flagged, and the last round changed nothing material. Cap at three rounds; after that, ship with the residual findings named in the cover note instead of grinding.

### Phase 7: Deliver

- Final DOCX (plus PDF when LibreOffice is available) and the plain-text version for paste-in application forms.
- Cover note: fit tier with the matrix summary (met, partial, gap), what changed per round, residual risks, and the open questions the candidate still owes you.
- Interview probes: the claims the readers pressed on, each with the ledger-backed answer the candidate should be ready to give.
- Never submit, send, or post anything on the candidate's behalf.

## Hard rules

1. No em dashes. Use commas, colons, semicolons, periods, or parentheses.
2. No number without a ledger row that records how it was measured. Qualify instead of quantify when no measurement exists.
3. No marketing tone, self-awarded titles, or AI-cadence openers ("spearheaded", "leveraged", "orchestrated", "passionate about", "results-driven", "thought leader"). Full list in `reference/anti-patterns.md`; the checker enforces it.
4. No overclaimed expertise: prompt engineering is not RLHF, reading C is not production C.
5. No hidden text, white text, tiny text, or text addressed to an AI reader, even if the candidate asks. Companies detect it and reject; it is also deceptive.
6. Specific over general: named tools, named scope, named outcomes.
7. Fit tier before drafting. Some applications should not be sent; say so.
8. Match the format to the audience and segment. One template does not fit every reader.
9. Respect candidate preferences (omit GitHub, no dollar figures, keep a role) even when you disagree; note the trade-off once.
10. Blind the critique. Never let a verdict turn on name, age signals, school prestige, or employment gaps as such.
11. Every bullet traces to the ledger; every hard requirement traces to a matrix row.

## Files

- `reference/workflow.md`: the phases in full detail, with checkpoints and outputs.
- `reference/evidence-ledger.md`, `reference/requirements-matrix.md`: formats and rules for the two working artifacts.
- `reference/screener-critique.md`: the three readers, rubric, severity, blinding, convergence.
- `reference/screener-personas.md`: company and segment archetypes for Reader B.
- `reference/anti-patterns.md`: banned phrasing and substitutions.
- `reference/ats-mechanics.md`: what applicant tracking systems actually do, with sources.
- `reference/industry-trends.md`: what changed recently (federal two-page rule, AI screening, injection detection).
- `reference/agent-tooling.md`: tool mapping per agent, fallbacks.
- `scripts/resume-check.js`, `scripts/docx-text.js`: the mechanical gate and the text extractor.
- `templates/`: DOCX builder (docx-js) and content pattern.
- `examples/walkthrough.md`: one full loop on a fictional candidate.
