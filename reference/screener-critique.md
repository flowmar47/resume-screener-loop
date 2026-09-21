# Screener Critique: Three Readers, One Rubric

A single in-character critic is not reliable enough to act on. Studies of model-based judges show verdicts that shift with formatting and phrasing alone, and that models rank identical resumes differently by the name at the top. The mitigations with evidence behind them are the ones used here: several readers with distinct jobs, a fixed rubric with named axes, evidence grounding, blinding, and a repeat-run test before a finding counts. Sources are in `ats-mechanics.md` and `industry-trends.md`.

## Before reading: blind the copy

Make a copy of the draft with the name replaced by "Candidate" and contact lines removed. Screen that copy. School names stay (they are evidence of a requirement) but are not to be weighed as prestige; employment gaps are noted as facts to label, never as verdict drivers. If you notice a verdict forming around any of these, that is the bias the blinding is for; discard the reasoning and restart from the rubric.

## The rubric

Every finding is tagged with one axis and one severity, quotes the offending line, and states the fix.

Axes:

| Axis | Question |
|---|---|
| **Fit** | Does the resume answer the matrix's hard and soft rows where a reader will look for them? |
| **Credibility** | Would each claim survive "how did you measure that?" and "show me"? Scope matches level? |
| **Clarity** | Can a reader extract title, company, dates, and the top three claims in seconds? Are bullets one to two lines with a specific verb and an outcome? |
| **Parse** | Will an ATS extract it cleanly? (The checker covers most of this; readers flag what it cannot, such as a role header that reads as a bullet.) |
| **Style** | Any banned phrasing, AI cadence, repeated openers, self-referential flattery, marketing tone? |

Severity:

- **Blocker**: would cause a pass at the first read, or is a house-rule violation (fabricated number, banned phrase, hidden text, unmet hard filter presented as met).
- **Major**: costs the candidate rank or credibility; fix before delivery.
- **Minor**: polish; fix if it costs nothing.

## Reader A: recruiter, 7-second scan

Recruiters' first pass is a scan, not a read: title, company, dates, previous title, education, then the skills block, in an F or E pattern down the page. Reader A simulates that and nothing more.

Procedure:

1. Look only at the top third of page one and the skills block. Do not read bullets.
2. Write down what you learned in that glance: current title, company, tenure, total years, location or remote statement, clearance, the five most visible skills.
3. Answer the knockout questions the application form will ask, from the resume alone: work authorization, location or relocation, years of experience, required credential or clearance, required language or platform. Any that cannot be answered from the page is a finding.
4. Verdict: **forward** (matches the req at a glance), **hold** (plausible but something is missing from the glance), **pass** (glance says wrong level, wrong domain, or missing filter).

Typical findings: the current title does not match the target level; dates are missing or year-only; location is absent; the strongest relevant role is below the fold; the skills block leads with irrelevant tools.

## Reader B: hiring manager, deep read

Reader B reads every line in character as the person who owns the req. Pick the archetype from `screener-personas.md` by the JD's language and company type; declare it first:

> Hiring manager: staff engineer running the payments platform team at a Series C fintech. Bar: production Go, has owned a service through incidents, can mentor, has touched compliance. Reading as that person.

Procedure:

1. State the bar in two lines.
2. **What works**: two to four specific things that land, quoting the line.
3. **What is wrong**: findings in priority order with axis, severity, quoted line, and the fix. Look for: years and level match; required languages or platforms present as production work; clearance at the right level; domain bridge for a pivot; customer segments named for customer-facing roles; public artifacts for engineering, developer-relations, and AI-deployment roles; mission signal for mission-driven companies; too many founder titles; scope language mismatched to the comp band.
4. **What would change my mind**: one to three concrete additions or changes.
5. Verdict in the words this manager would use to the recruiter: forward, forward-flagged (name the flag), hold, pass.

Stay in the persona's voice. Generic praise and generic criticism are both failures of this reader.

**Repeat-run rule.** Run Reader B twice, with a fresh start (a new context or an explicit second pass that does not look at the first). Keep a finding if it appears in both runs, or if it is objectively checkable (a missing hard row, a number without a ledger basis, a banned phrase). Drop taste findings that appear once. This is the cheap version of the inter-run agreement test used to measure judge reliability, and it removes most of the noise a single critic produces.

## Reader C: skeptic

Reader C reads the annotated draft (bullets tagged with ledger ids) next to the ledger and assumes every claim is inflated until shown otherwise.

For each bullet:

- Do the cited rows support the claim at the scope written? Wider team, bigger system, more ownership than the row says is a finding.
- Any number: is there a basis in the ledger? No basis, the number goes.
- Any tool or language: does a role or artifact row show it in use, not just listed?
- Any outcome verb ("reduced", "improved", "grew"): what is the mechanism, and is the mechanism in the ledger?
- Titles and dates: identical to LinkedIn and the old resume? A mismatch is a finding even when the resume's version is the honest one; the candidate needs to align the sources.
- Style: AI-cadence openers, uniform bullet rhythm, interchangeable bullets that would read the same at another company, self-referential flattery of the target company.

Output: a list of challenged claims with the question a real interviewer would ask, plus the ledger-backed answer if one exists. Claims with no defensible answer are blockers. The surviving list becomes the **interview probes** section of the cover note.

## Convergence

After each revision round:

1. Rerun the mechanical gate. It must pass.
2. Re-screen with the readers whose findings were touched (all three after a structural change).
3. Log the round: findings fixed, findings remaining, findings newly introduced.

Stop when all of these hold:

- No blocker or major findings remain from any reader.
- Reader A says forward.
- Reader B says forward or forward-flagged, and the flag is something only the candidate can change (a missing artifact, a real gap).
- The last round changed nothing material.

Hard cap: three rounds. Loops that run longer oscillate between two readers' tastes. Ship with the residual findings named plainly in the cover note.

## Writing the critique for the candidate

The candidate sees a condensed version: each reader's verdict, the findings that survived, what changed, what remains, and the interview probes. Keep the in-character voice for Reader B's verdict line; it is the most useful sentence in the whole deliverable. Do not soften it.
