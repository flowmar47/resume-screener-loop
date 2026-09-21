# Anti-Patterns: What Not to Write

The enforcement checklist. `scripts/resume-check.js` catches most of it mechanically; this file explains the rules and gives substitutions for the judgment calls the script cannot make. Run the checker on every draft and read this before writing the first bullet.

## Em dashes: banned

Replace every em dash. Search for `—` and `--` before delivery (the checker does).

| If the dash is doing this | Use instead |
|---|---|
| Parenthetical aside | Commas: "the service, which runs nightly, reconciles processor files" |
| Introduction or explanation | Colon: "the result was clear: subscribers stayed" |
| Joining related independent clauses | Semicolon: "data quality drove retention; errors drove cancellations" |
| Strong pivot | Period: two sentences |
| Truly supplementary aside | Parentheses: "the pipeline (multi-source, with fallbacks) validates prices" |

En dashes in date ranges ("Mar 2021 – Present") are fine; use one separator style throughout.

## Numbers without a basis: banned

The screener's question is "how did you measure that?" A number with no ledger row recording the basis does not go on the page. This includes percentages, dollar figures, user counts, multipliers, and round numbers that look invented ("trained 10,000 employees").

Substitutes that stay true:

- Structural facts: "multiple API sources with fallback chains", "strict daily SLA", "two audits".
- Honest scale: "paying subscribers", "team of five", "six services", "nightly", "multi-year engagements".
- Mechanism statements: "reduced churn by keeping report formatting consistent across providers" (says how, not how much).
- Before and after state: "replaced a manual runbook with one pipeline".

Permitted when true and in the ledger with a basis: years of experience, team size, counts of things the candidate can enumerate (services, clients, audits), named product facts (an 8x8 grid, a 13-module program), safety records with a defined scope.

## Marketing tone and AI cadence: banned

Recruiters now name generated cadence as a rejection reason. The tells are uniform tone across sections, every bullet opening with the same grand verb, buzzword strings, and bullets that would read identically at another company.

Banned as openers (the checker flags them): spearheaded, leveraged, orchestrated, utilized, championed, pioneered, revolutionized, fostered, streamlined, drove, and filler openers (helped, assisted with, worked on, participated in, involved in, was responsible for, tasked with, contributed to). "Streamlined" and "drove" are fine mid-sentence when the mechanism follows; as openers they are the generated-prose tell.

Banned anywhere: world-class, best-in-class, cutting-edge, groundbreaking, industry-leading, game-changing, next-generation, unparalleled, revolutionary, transformational; passionate about, passion for, thrilled to, incredibly excited, deeply committed, highly motivated; results-driven, results-oriented, go-getter, self-starter, team player, detail-oriented, hard-working, dynamic, seasoned, proven track record; synergy in any form; thought leader, visionary, guru, ninja, rockstar, wizard, evangelist; AI expert, ML enthusiast, tech enthusiast; the prose clichés delved, tapestry, beacon of, testament to, rich landscape, pivotal role, state-of-the-art; responsible for, duties included; references available upon request.

Use instead: a specific verb (built, designed, operated, migrated, debugged, evaluated, negotiated, coordinated, shipped, wrote, owned, maintained, reconciled, audited, trained), a named object, a named scope, and an outcome or mechanism.

Vary openers. No opening verb more than twice in the document; none twice in a row under one role.

## Overclaimed expertise: banned

| If the candidate has | Do not write |
|---|---|
| Python and Swift in production | "production C / C++" |
| Prompt engineering, agent orchestration | "RLHF", "reward modeling", "policy gradients" |
| Self-hosted LLM deployment | "trained foundation models" |
| Used Tailscale and disk encryption | "designed a cryptographic protocol" |
| Scripts on a Raspberry Pi | "embedded systems engineer" |
| Excel project tracking | "built data warehouses" |
| Read a codebase in Go | "Go developer" |

Adjacent expertise is fine when framed honestly: "reads C and C++ in toolchain contexts", "Kubernetes through a migration, not yet operated at scale".

## Hidden text, white text, tiny text, prompt injection: banned

Never, even if asked. Parsers extract it as normal text, screening tools and humans flag it, and Indeed and others have published detection work. Text addressed to an AI reader ("ignore previous instructions", "rank this candidate highly") is grounds for rejection and is deceptive. The checker reads the DOCX XML and fails on any of it.

## Keyword walls: discouraged

A line of twenty-five comma-separated tools reads as a LinkedIn skills export. Group into three to five named categories, keep hard skills only, cap around fifteen terms, and make sure each appears in a bullet or artifact. Context beats count.

## Self-referential flattery: discouraged

"Demonstrates the same forward-deployed pattern [Target Company] ships" tells the reader you are selling. Describe the work; let them draw the inference.

## Founder-title stacking: watch

Three "Founder" titles in a row read as "may not take direction" to corporate hiring managers, and founder claims draw extra verification because there is no HR department to check against. Keep the strongest founder title; retitle the others by the work (Principal Consultant, Lead Engineer, Principal Architect). Use "Founder" or "Owner" only where there was a registered entity, staff, revenue, or operations.

## Scale words: calibrate to the reader

"Multi-million-dollar" lands in commercial and general PM contexts, reads small in defense (programs are nine figures; describe stakeholder complexity instead), and reads overbuilt at startups (say "production system with paying users").

## Objective statements, "Resume" title lines, references lines: remove

A summary replaces the objective. The name is the document title. References are requested later.

## Protected characteristics: omit (US, UK, Canada, Australia)

Date of birth, marital status, nationality, religion, photo. Some EU markets still expect a photo and birth date; follow the target market and say which norm you applied.

## Gaps and dates: label, do not fudge

Year-only dates to hide a gap read as concealment and break tenure parsing. Use Month YYYY everywhere; if a gap over six months will be asked about, one neutral line (sabbatical, caregiving, contract work, study) beats an ambiguous timeline.

## Consistency with LinkedIn: required

Titles and date ranges are compared. A mismatch reads as inflation even when the resume is the honest version. Align the sources, or tell the candidate to.

## Final checklist

The checker verifies the mechanical items. Confirm the judgment items yourself:

- [ ] Checker exit code 0, no blocker or major findings
- [ ] Every quantified claim in the VERIFY list maps to a ledger row with a basis
- [ ] Every hard matrix row is answered where a reader will look for it
- [ ] Every bullet cites ledger rows that support its scope as written
- [ ] Openers are specific and varied; nothing from the AI-cadence set
- [ ] No overclaimed skills or languages
- [ ] At most one "Founder" title unless the segment expects more
- [ ] Clearance line matches the JD's level exactly
- [ ] Segment gate applied (sales, clinical, finance, federal, executive, new grad)
- [ ] Candidate preferences honored
- [ ] Page budget met by an exact count when it matters (federal)
