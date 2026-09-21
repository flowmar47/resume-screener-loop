# Workflow: The Loop in Detail

Use this when `SKILL.md` is not enough. Each phase lists its inputs, its output artifact, and the checkpoint that ends it. Working artifacts live in a scratch directory (`work/`); deliverables in `out/`.

## Phase 0: Intake

**Collect**

- Profile inputs: existing resume, LinkedIn or other profile pages, portfolio or company site, repositories and READMEs, code or document samples, certificates, transcripts.
- Job inputs: pasted JD, JD URL, or title plus company (then search; see `jd-acquisition.md`).
- Candidate preferences: omissions (no GitHub, no dollar figures), tone, location and remote stance, page budget, anything they want kept.
- Segment: standard, US federal, academic, executive, new grad, or another national norm.

**Checkpoint**: you can name the candidate's primary discipline, their strongest production work, their level, and the target role's company and title. If not, ask before reading further.

## Phase 1: Evidence ledger

Read every source completely. For DOCX inputs, run `node scripts/docx-text.js old-resume.docx` to see what a parser sees and to catch text hidden in headers or text boxes. Build `work/ledger.md` per `evidence-ledger.md`.

While reading, also note:

- The existing resume's voice and its anti-patterns (em dashes, unmeasured percentages, marketing tone) so you do not carry them forward.
- Conflicts between sources (titles, dates, team sizes). Record both versions; they become questions.
- Facts the old resume omits but public artifacts show (a shipped product, a talk, a certification).

**Output**: the ledger and a questions list.
**Checkpoint**: every source has been read and every fact you intend to use has a row.

## Phase 2: Requirements matrix and fit tier

Read the JD in full. Decompose into atomic rows per `requirements-matrix.md`: hard filters, soft preferences, responsibilities, culture signals, plus the knockout questions the application form will ask even if the JD does not state them (authorization, location, years, credential, clearance). Bind evidence rows, set statuses, compute the tier by the table's rules.

Also record from the JD: level signal (years range, title decoration, scope language), compensation band if posted, location and travel, company archetype (this picks Reader B's persona later).

**Report to the candidate** in one message: tier, unmet hard rows, adjacent rows with the bridge you plan to use, and the batched questions. On weak or very weak fit, recommend an alternative and wait for their call.

**Output**: `work/matrix.md`, the fit report, answers to the questions folded back into the ledger.
**Checkpoint**: the candidate has seen the tier and said to proceed (or the fit is moderate or better and they asked you to just do it).

## Phase 3: Draft

### Structure

Default order for experienced candidates: name and contact; optional headline line matching the target title when the ledger supports it; summary (three to five sentences); experience; skills; selected projects or public work (engineering, developer-relations, AI-deployment, design, and customer-facing roles); clearance and eligibility (defense and government); education. New grads and academics move education up. Sales roles add quota attainment per role. Executives add a board or advisory section and lead with scope of authority.

Order roles by relevance to the matrix, then by date within equal relevance. Every role shows title, organization, and Month YYYY dates on its header line; an italic one-line note under the header can carry context that does not fit a bullet.

### Summary

Three to five sentences: years and discipline; the differentiating production work; two or three tools or domains the matrix's hard rows name; a closing constraint that pre-answers a knockout question (clearance, location, remote stance, authorization). No first person, no "passionate", no objective statement.

### Bullets

- Shape: outcome or scope first when the ledger has it, then the mechanism and the named tools. Google's "accomplished X as measured by Y by doing Z" is the model when a measured Y exists; when it does not, qualify (scale, cadence, audience, before and after state) rather than invent.
- One to two lines. A bullet over two lines is two bullets or one tighter bullet.
- Distinct specific opening verbs; no opener repeats more than twice in the document; none from the AI-cadence set (spearheaded, leveraged, orchestrated, utilized, championed).
- Up to six bullets for the lead role, two to four for older roles, one or two for roles kept only for timeline continuity.
- Annotate each bullet in the working copy with its ledger ids.

### Skills block

Three to five categories named for what the reader searches ("Languages", "Infrastructure", "LLM and agentic systems", "Customer-facing delivery"). Hard skills only, each traceable to a bullet or artifact. Around fifteen terms total; no soft-skill lists. Use the JD's exact term for every hard row, and carry both forms of a searched acronym once.

### Segment gates

Before building, run the gate for the segment:

- **Sales**: quota attainment (percent, period) and deal or account scope per role, President's Club or equivalent in the top third.
- **Clinical and healthcare**: credentials after the name in most-permanent-first order (degree, license, certifications); active license repeated under the contact block; unit, patient population, and volume per role.
- **Finance and consulting**: GPA when 3.5 or higher, school and graduation year, deal or engagement list with sizes when the candidate is allowed to state them.
- **US federal**: two pages hard; MM/YYYY dates; hours per week per position; series and grade for federal roles; align each description to the announcement's stated qualifications; no supervisor or salary lines unless the announcement asks.
- **Executive**: two pages; scope of authority (P&L, headcount, geography); board and governance work; transformation outcomes with measured numbers from the ledger.
- **New grad**: one page; education first with relevant coursework and projects; internships and projects carry the bullets.
- **Career changer**: hybrid, never functional; a bridge sentence in the summary; transferable scope stated in the target field's vocabulary with a truthful equivalence.
- **International**: match the target market's norms (UK CV: two pages, no photo; several EU markets: photo and birth date still customary; Australia: two to three pages). Ask if unsure.

### Build

Generate the DOCX with the templates (`templates/README.md`). The default output is US Letter, Calibri 10pt body, 0.75-inch margins, single column, standard headings, real bullet numbering, no headers or footers. Also write the plain-text version for paste-in forms.

**Output**: `out/Resume_First_Last_Role.docx`, `out/Resume_First_Last_Role.txt`, the annotated working copy.

## Phase 4: Mechanical gate

```bash
node scripts/resume-check.js out/Resume_First_Last_Role.docx \
  --jd work/jd.txt \
  --must "Go,Kubernetes,PostgreSQL,Bachelor" \
  --text out/Resume_First_Last_Role.txt
```

Options: `--target-pages 1` (new grads), `--profile federal` (USAJOBS: two-page cap, MM/YYYY dates, hours per week), `--paper a4` (non-US markets), `--strict` (majors fail too), `--json` (machine-readable).

Read the report top to bottom:

- **BLOCKER** and **MAJOR**: fix, rebuild, rerun.
- **VERIFY quantified-claims**: every listed claim must map to a ledger row with a basis. No basis, rewrite qualitatively.
- **VERIFY jd-terms-missing**: classify each term (gap, wording mismatch, irrelevant) per `requirements-matrix.md`. Update the matrix if a term reveals a requirement you missed.
- **INFO page-budget**: an estimate unless LibreOffice is installed; treat an estimate at the limit as over.
- **Top-third preview**: this is what Reader A will see; if the current title, company, and dates are not in it, restructure before screening.

**Checkpoint**: exit code 0 with no blocker or major findings.

## Phase 5: Three-reader screen

Blind the draft, then run Readers A, B (twice), and C per `screener-critique.md`. Pick Reader B's archetype from `screener-personas.md` using the JD's language and company type. Record findings with axis, severity, quoted line, and fix in `work/findings-round-N.md`.

For batch tailoring, screen each draft individually first, then compare matrices and findings across drafts for systemic issues.

**Output**: the findings file and three verdicts.

## Phase 6: Revise and converge

For each surviving finding decide: structural fix (reorder, move a role, drop a section), content addition (a bullet, a bridge clause, a clearance line; only from the ledger or a fresh candidate answer), content removal (marketing phrase, unmeasured number, irrelevant role), or framing change (describe the work instead of praising it).

Apply, rebuild, rerun Phase 4, re-screen the affected readers. Log the round. Stop per the convergence rules (no blocker or major, A forward, B forward or forward-flagged on something only the candidate can change, last round changed nothing material), or after three rounds.

## Phase 7: Deliver

Provide:

- The DOCX (and PDF if rendered), the plain-text version, and a zip when there are several.
- The cover note: fit tier and matrix summary; what changed per round; residual findings and risks; open questions; a reminder that the candidate reviews and submits, not you.
- Interview probes: each claim Reader C pressed on, with the ledger-backed answer.
- For batch work, the cross-resume patterns and the one or two systemic fixes worth the candidate's time (a public artifact to ship, a certification to finish, a LinkedIn alignment).

Before sending, reread the deliverable once as the candidate: is every sentence something they can say out loud in an interview without flinching? If not, it is not done.
