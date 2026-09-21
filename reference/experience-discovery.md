# Experience Discovery: Asking the Candidate

Rows in the requirements matrix with status `ask`, `partial`, or `adjacent` are the only reason to interview the candidate. The goal is a fact that becomes a ledger row, not a career retrospective.

**Cap: five questions per batch**, asked once at the fit-tier checkpoint. A second batch is allowed only if a reader exposes a gap that only the candidate can fill. If they want a deeper interview, they will say so.

## Principles

1. **Tie every question to a matrix row.** Name the requirement and what the ledger currently shows for it.
2. **Branch on the answer**; do not read a list.
3. **Record answers verbatim as ledger rows** (source `chat`, confidence `stated`). Do not embellish in the notes; the skeptic reads them.
4. **A tutorial is not production.** Answers upgrade a row's status only when the fact would survive an interviewer's follow-up.

## Skill gap

> The posting requires {skill}. I have {adjacent evidence or nothing} for it. Have you used {skill} or {related} in production, in consulting work, or in a substantial side project?

- **Direct yes**: what did you build, at what scale, production or development only, what broke, how was success judged? Capture a bullet with named tools and honest scope; status `met`.
- **Indirect**: what was your role relative to the work? Capture enabling or support framing if substantial; status `partial`.
- **Adjacent only**: did the adjacent work include {the activity the JD cares about}? Capture a bridge clause if defensible; status `adjacent`.
- **Learning or personal only**: what shipped, how recently? Include only when the row is hard and the work is real; otherwise status `gap`.
- **No**: status `gap`. Say so in the fit note.

## Soft-skill or experience gap

> The role emphasizes {phrase from the JD}. Tell me about one time you did that, with the stakeholders involved and what came of it.

- **Concrete example**: who, what changed, any scale the candidate can defend. Capture as an achievement row.
- **Vague**: reframe once ("have you ever {alternate framing}?"). Help them articulate; do not write fiction.
- **Project-specific**: their role versus others, cross-functional scope. Capture a coordination row if substantial.

## Metric without a basis

> Your old resume says {number}. How was it measured, over what period, against what baseline? If you are not sure, I will describe the change instead of the percentage.

- Basis given: record it in the ledger's basis column; the number may be used.
- No basis: record `unmeasured`; the bullet describes the mechanism and scope instead.

## Stale resume

> What have you worked on in the last six to twelve months that is not on the resume yet?

- Project described: role, stack, problem, outcome; check which matrix rows it touches.
- Nothing new: process changes, tools adopted, mentoring, internal talks. Small real items can move a `partial` row.

## Conflicts between sources

> LinkedIn shows {title, dates}; the resume shows {title, dates}. Which is right? The final resume and your LinkedIn should match exactly.

Record the answer and tell the candidate to align the other source before applying.

## Batch sessions

When a gap appears across several target roles, ask once and tag the answer with the roles it serves. Order questions by leverage: gaps in three or more roles first, then two, then one. See `batch-workflow.md`.

## After the answers

Add the rows, recompute the matrix statuses and the fit tier, and report the new tier if it changed. Then ask the strategic questions in `strategic-questions.md` and start drafting.
