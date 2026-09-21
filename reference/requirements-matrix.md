# Requirements Matrix

The matrix binds each requirement in the JD to the evidence that satisfies it. It replaces the free-form fit assessment with something auditable, it tells you what to write and where, and its unbound rows are the honest list of gaps and questions.

This mirrors how structured screening works now: several ATS vendors evaluate per criterion ("meets / does not meet / uncertain") rather than computing one score, and hiring teams increasingly use rubric-based resume reviews. Build the artifact they will effectively build.

## Format

Keep it in `work/matrix.md`.

| id | requirement | type | weight | evidence | status | placement |
|---|---|---|---|---|---|---|
| R1 | 5+ years backend engineering | hard | 3 | E1, E7 (2017 to present) | met | summary, role dates |
| R2 | Production Go | hard | 3 | E2 | met | role 1 bullet 1, skills |
| R3 | Kubernetes in AWS | hard | 3 | E8 (EKS migration) | met | role 1 bullet 2, skills |
| R4 | Terraform / infrastructure as code | soft | 2 | E8 | met | role 1 bullet 2 (use JD phrase once) |
| R5 | Payments or fintech domain | soft | 2 | E1 (Acme Payments), E5 (PCI DSS) | met | summary, role 2 |
| R6 | Mentoring / leading code review | responsibility | 1 | E3 | met | role 1 bullet 4 |
| R7 | Bachelor's in CS or equivalent | hard | 2 | E12 (B.S. CS 2017) | met | education |
| R8 | gRPC | soft | 1 | E9 | met | role 1 bullet 3 |
| R9 | Workshops for engineering teams | soft | 2 | none | ask | pending candidate answer |
| R10 | Active Secret clearance | hard | 3 | E14 (none; willing to obtain) | gap | fit note |

Columns:

- **type**: `hard` (a filter; "required", "must", years, degree, clearance, work authorization, a named language or platform in the required list), `soft` (preferred, nice to have, bonus), `responsibility` (what the role does day to day), `culture` (values and working-style signals). Knockout questions the application form will ask (authorization, relocation, clearance, salary range, years) are always `hard` even if the JD buries them.
- **weight**: 3 for hard filters and anything repeated or emphasized, 2 for soft requirements the JD spends a sentence on, 1 for the rest.
- **evidence**: ledger row ids. Empty is allowed; it is the signal.
- **status**: `met` (rows satisfy it as written), `partial` (rows satisfy part: fewer years, a smaller scale, one of two named tools), `adjacent` (a defensible substitute: Terraform for "IaC", Postgres for "relational databases", solar PM for "regulated program delivery"), `gap` (nothing), `ask` (the candidate may have it; a question is pending).
- **placement**: where on the resume it will be answered, or `fit note` if it will not be.

## Fit tier rules

Compute the tier from the matrix. Do not eyeball it.

| Tier | Rule |
|---|---|
| **Strong** | All hard rows met; at least two thirds of soft rows met or adjacent. |
| **Moderate-strong** | All hard rows met; between one third and two thirds of soft rows met or adjacent. |
| **Moderate** | All hard rows met or adjacent (at most one adjacent with a stated bridge); fewer than one third of soft rows met. |
| **Weak** | Exactly one hard row is a gap or partial with no defensible substitute, or two or more hard rows are only adjacent. |
| **Very weak** | Two or more hard rows are gaps, or a non-substitutable hard row is a gap (citizenship, active clearance, licensure, a degree the law requires). |

Rows with status `ask` are treated as gaps for the tier until answered; recompute after the candidate replies.

Report to the candidate before drafting: the tier, every hard row not met, the adjacent rows and the bridge you will use, and the questions list. On weak or very weak, recommend the alternative (a different role at the same company, a cover letter that addresses the gap directly, or not applying) and continue only if they choose to.

## How the matrix drives the draft

- **Hard rows** get the most visible placement: summary, first bullets, skills block, a clearance line. Each hard row's exact JD wording appears at least once where the evidence supports it.
- **Soft rows** fill the remaining bullets in weight order.
- **Responsibility rows** shape verbs and framing: describe the candidate's work in the terms the JD uses for the job to be done.
- **Culture rows** tune the summary's tone (mission language for mission-driven companies, ownership language for startups), never with the banned vocabulary.
- **Adjacent rows** get a bridge: one clause that names the equivalence ("Terraform-managed infrastructure" answers "infrastructure as code"; "regulated multi-stakeholder programs" bridges solar PM to defense TPM). The bridge must be true and defensible in an interview.
- **Gaps** are never papered over. They go in the fit note and, if the candidate proceeds, into cover-letter advice.

The `--must` flag of `scripts/resume-check.js` takes the hard rows' key terms so the mechanical gate fails loudly if a revision drops one.

## Keyword decisions

The checker's list of JD terms missing from the resume is a diagnostic, not a target. For each term decide:

- **Genuine gap**: it maps to a `gap` row. Leave it out; it is already in the fit note.
- **Wording mismatch**: the ledger has the skill under another name. Use the JD's term once where the evidence sits, and keep the acronym and expansion both present if recruiters search either.
- **Irrelevant**: boilerplate or a term about the company, not the candidate. Ignore.

Coverage counts are not a score to maximize. A resume that names twenty JD terms it cannot defend fails Reader C and the interview.

## Batch tailoring

With several JDs, build one ledger and one matrix per JD. After screening each draft, compare the matrices: a row that is `gap` or `ask` across most roles is a systemic weakness worth a conversation with the candidate (a missing public artifact, an uncertified skill, a vague scope claim), not a per-resume patch.
