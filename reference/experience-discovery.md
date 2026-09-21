# Targeted Experience Discovery

Phase 1.5 only. Goal: fill **🟡 adjacent** gaps and surface undocumented work without re-running a full career interview.

**Cap: 5 questions total per session.** Each answer should be able to become a bullet or scorecard upgrade.

## When to run

- Gap scorecard has 🟡 rows the user might clarify.
- JD requires workshops, public writing, named tools, or customer segments not on the resume.
- Profile is thin but the user claims relevant experience in chat.
- Batch mode: shared gaps across multiple JDs (ask once, tag relevance per job).

## Principles

1. **Branch on answers** — do not read a static questionnaire. See patterns below.
2. **JD-tied** — every question references a specific requirement or scorecard row.
3. **Truth-preserving** — capture what the user says; do not embellish in notes.
4. **Compound value** — append durable discoveries to `content.js` or the user's master profile if they maintain one.

## Technical skill gap pattern

```
PROBE: "The JD requires {SKILL}. Your scorecard shows {adjacent evidence or none}.
       Have you used {SKILL} or {RELATED} in production, consulting, or a substantive side project?"

If YES (direct):
  → What did you build? What scale? Production or dev only?
  → What broke? How did you measure success?
  → CAPTURE: bullet with named tools and honest scope

If INDIRECT:
  → What was your role relative to the {SKILL} work?
  → CAPTURE: enabling/support framing if substantial

If ADJACENT only:
  → Describe {ADJACENT_TECH} work — did it include {relevant_activity}?
  → CAPTURE: related expertise line if defensible

If PERSONAL/LEARNING only:
  → What did you ship? How recent?
  → ASSESS: include only if gap is critical and work is substantive

If NO:
  → Note ❌ on scorecard; do not fabricate
```

## Soft skill / experience gap pattern

```
PROBE: "The role emphasizes {SOFT_SKILL} — e.g. '{JD phrase}'.
       Tell me about a time you {demonstrated_that} with named stakeholders."

If STRONG example:
  → Who was involved? What was the outcome? Any verifiable scale?
  → CAPTURE: achievement bullet

If VAGUE:
  → Reframe: "Have you ever {alternate framing}?"
  → Help articulate; do not write fiction

If PROJECT-SPECIFIC:
  → Your role vs others? Cross-functional scope?
  → CAPTURE: leadership/coordination bullet if substantial
```

## Recent work probe

Use when the resume may be stale:

```
"What have you worked on in the last 6–12 months that isn't on your resume yet?"

If project described:
  → Role, stack, problem, impact
  → Does this address scorecard row {X}?

If "nothing new":
  → Process changes, tools adopted, mentoring, internal talks?
  → Small items can fill 🟡 gaps if real
```

## Multi-job leverage context

When the same gap appears in multiple JDs:

```
"{SKILL} appears in {N} of your target roles ({Company A}, {Company B}, ...).
This is a {HIGH|MEDIUM|LOW}-leverage gap — answering once helps {N} applications.
Current best match: {evidence summary}

{Standard probe}"
```

- **HIGH:** 3+ jobs
- **MEDIUM:** 2 jobs
- **LOW:** 1 job

## What not to do

- Do not ask more than 5 questions in one session unless the user explicitly wants deeper discovery.
- Do not accept hand-wavy answers and upgrade scorecard status without concrete facts.
- Do not use discovery to justify overclaiming (e.g. one tutorial → "production Kubernetes").

After discovery, update working profile, re-run gap scorecard, then proceed to strategic questions (`strategic-questions.md`).
