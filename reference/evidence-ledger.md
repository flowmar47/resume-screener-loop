# Evidence Ledger

The ledger is the only source the resume may be written from. It exists because the most common failure of any model writing a resume is a plausible bullet that the candidate never did. A ledger turns "do not fabricate" from an instruction into a check you can run: a bullet with no row is a defect.

## Format

Keep the ledger in a scratch file (`work/ledger.md`), one row per fact. Markdown table or one line per row, whichever you can keep tidy.

| id | fact | source | locator | kind | confidence | basis |
|---|---|---|---|---|---|---|
| E1 | Senior Software Engineer, Acme Payments, Mar 2021 to present | resume.docx | Experience, role 1 | role | stated | |
| E2 | Built nightly settlement reconciliation service in Go, PostgreSQL, Kafka | github.com/avery/recon README | Architecture section | project | observed | |
| E3 | Team of five, mentors two engineers | LinkedIn About | paragraph 2 | scope | stated | |
| E4 | "Cut deploy time by 60%" | old resume | role 1 bullet 3 | metric | stated | unmeasured: candidate to confirm baseline |
| E5 | PCI DSS scoping through two audits | old resume + LinkedIn | role 2 bullet 2 | credential | stated | |
| E6 | Prefers no GitHub link on the resume | chat | 2026-09-21 message | constraint | stated | |

Columns:

- **id**: E followed by a number. Stable for the session; bullets cite these ids in your working notes.
- **fact**: one fact, stated plainly, in the candidate's own scope. Split compound claims into separate rows.
- **source** and **locator**: which document or page, and where in it. Enough to re-find it.
- **kind**: role, project, metric, scope, skill, credential, artifact (public site, repo, talk, article), education, constraint (location, clearance, travel, preferences), or context (industry, customer segment).
- **confidence**: `stated` (the candidate or their documents assert it), `observed` (you saw the artifact: code, site, published work), `inferred` (you concluded it from other rows; say from which). Inferred rows may inform framing but never become standalone claims.
- **basis**: for metrics only. How the number was measured, over what period, against what baseline. If unknown, write `unmeasured` and add a question. Unmeasured numbers never reach the resume.

## Rules

1. **Read everything before writing anything.** A ledger built from half the sources produces a resume that undersells the candidate and a screener pass that flags gaps you could have filled.
2. **Prefer the authoritative source.** Public artifacts and dated documents beat memory. When two sources disagree (dates, titles), record both, mark the conflict, and ask.
3. **Skills need a carrier.** A skill row must point to a role, project, or artifact row where it was used. Skills with no carrier are aspirational and stay off the resume, or go in a clearly labeled "familiar with" line only if the candidate insists.
4. **Scope is a fact.** Team size, budget, users, customers, cadence, SLA, regulatory regime: capture these; they are what let a bullet be specific without a fabricated percentage.
5. **Constraints and preferences are rows too.** Location, remote preference, clearance status, travel tolerance, and the candidate's do-not-include list all live here so nothing gets lost between phases.
6. **Numbers carry their basis or they are questions.** "Reduced incidents 40%" with no baseline becomes a question: "Over what period, measured how?" If the answer never comes, the bullet says what was built and how it ran, not the percentage.

## Questions for the candidate

Facts you want but do not have become questions. Collect them; ask in one batch at the fit-tier checkpoint (end of Phase 2), and again at most once after the screen if a reader exposed a gap only the candidate can fill.

Good questions name the gap and the reason:

> The JD requires "experience delivering workshops to engineering teams." I have no row for that. Have you run any training sessions, internal or external, even half-day ones? Audience, topic, roughly when.

> Your old resume says "cut deploy time by 60%." How was that measured, and against what baseline? If you are not sure, I will describe the change instead of the percentage.

Bad questions are open-ended ("tell me more about your experience") or ask for things already in the sources.

If the candidate does not answer, proceed without the fact and say so in the cover note.

## Provenance in the draft

While drafting, annotate each bullet in your working copy with the row ids it draws on, for example `[E2, E3]`. Strip the annotations from the deliverable. Reader C (the skeptic) reads the annotated copy and challenges any bullet whose rows do not support the claim as written: wider scope than the row, a metric with no basis, a tool the row does not mention.

## What the ledger does not do

It does not decide what goes on the resume. That is the requirements matrix's job (`requirements-matrix.md`). The ledger is the universe of true things; the matrix picks the ones this job needs.
