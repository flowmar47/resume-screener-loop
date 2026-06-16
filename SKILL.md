---
name: resume-screener-loop
description: |
  Tailor a resume for a specific job, role-play as the company's hiring screener to critique it, then apply the critique in a final revision pass. Use whenever the user asks to tailor, customize, optimize, ATS-tune, or rewrite a resume or CV for a specific role, company, or job description, especially when they want honest critique before finalizing. Triggers include "tailor my resume for [role]", "rewrite for this JD", "screen and improve my resume", "would a recruiter pass this", "ATS optimize", "apply for [role] at [company]", "batch tailor", "critique my resume for this job", or sharing a JD URL with resume intent. Accepts profile inputs in any form (existing resume, portfolio, READMEs, repos, LinkedIn/Indeed, supporting docs) and job specs as pasted JD, URL, or title+company (search for the JD). Produces an honest fit assessment, gap scorecard, tailored draft, ATS keyword report, in-character screener critique, and revised final DOCX with cover note. Do not use for format-only conversion, contact updates, generic resume writing without a target role, or LinkedIn profile rewrites.
---

# Resume Screener Loop

A five-phase workflow (plus optional discovery and batch extensions) for producing a tailored resume that survives ATS parsing, recruiter skim, and hiring-manager scrutiny. The differentiator is adversarial self-review: after building the draft, role-play as the company's hiring screener, then apply findings in a final pass.

**Core principle:** Truth-preserving optimization. Maximize fit while maintaining factual integrity. Never fabricate experience; reframe and emphasize only what the candidate can defend in an interview.

## When to use

Trigger when the user wants a **defensible, role-specific resume**, not a marketing piece.

| Mode | When | Phases run |
|------|------|------------|
| **Full loop** (default) | One role, full tailor + screen + revise | 0 → 1 → (1.5) → 2 → 3 → 4 |
| **Batch** | 2+ roles in one session | Shared 0–1.5, then 2–4 per role |
| **Critique-only** | User already has a draft | 1 (light) → 3 → 4 |
| **Screen-only** | User wants screener verdict only | 1 (light) → 3 |

**Do not trigger for:** format conversion, contact-only edits, generic resume writing without a target JD, LinkedIn rewrites, or cover letters (offer separately; see `reference/strategic-questions.md`).

## Reference files (load on demand)

Read these when the phase requires them; do not load everything at session start.

| File | Load when |
|------|-----------|
| `reference/profile-ingestion.md` | Phase 1 profile intake |
| `reference/jd-acquisition.md` | Phase 1 JD fetch or parse |
| `reference/gap-scorecard.md` | Phase 1 fit + gap table |
| `reference/experience-discovery.md` | Phase 1.5 has 🟡 gaps or thin profile |
| `reference/strategic-questions.md` | Before Phase 2 draft (positioning) |
| `reference/bullet-patterns.md` | Phase 2 bullet writing |
| `reference/ats-optimization.md` | Phase 2 ATS pass |
| `reference/anti-patterns.md` | Every draft and revision |
| `reference/screener-personas.md` | Phase 3 persona selection |
| `reference/industry-trends.md` | Phase 2–3 calibration |
| `reference/batch-workflow.md` | Multiple roles in one session |
| `reference/workflow.md` | Extended phase detail |
| `examples/walkthrough.md` | Need a worked example |

## Required inputs

Gather both halves before Phase 2:

**Profile** (any combination): existing resume, portfolio/site URL, project READMEs or repo URLs, code samples, LinkedIn/Indeed URL, certifications, transcripts, case studies.

**Job** (any of): full JD text, JD URL (`web_fetch`), or title + company (`web_search` then fetch).

If profile inputs are thin, run Phase 1.5 discovery or ask for more. If the job is unclear, ask for a JD URL or paste. Do not proceed on assumptions.

## Output contract

Per role, deliver unless the user opts out:

1. **Fit assessment** — five-tier score with named gaps (before drafting).
2. **Gap scorecard** — JD requirement vs profile evidence table (see `reference/gap-scorecard.md`).
3. **Tailored DOCX** — ATS-friendly, 1–2 pages (see `templates/` + `scripts/build-resume.js`).
4. **ATS keyword report** — must-have coverage; not printed on the resume (see `reference/ats-optimization.md`).
5. **Screener critique** — in-character verdict, what works, what's wrong, what would change the screener's mind.
6. **Final revised DOCX** — critique applied, linter clean, page count verified.
7. **Cover note** — fit tier, what changed in revision, stretch flags, upload guidance (.docx for ATS vs PDF for humans).

**Naming:** `Resume_<LastName>_<Company>_<RoleSlug>.docx`. Batch: zip multiple DOCXs.

**Working artifacts** (optional, if user wants persistence): `content.js`, `build_<role>.js` in a per-role folder.

---

## Phase 0: Resolve inputs and mode

1. Detect mode: single role, batch (multiple JDs/URLs, "batch tailor", list of companies), critique-only, or screen-only.
2. Resolve profile: read pasted files, `web_fetch` URLs, read repo READMEs.
3. Resolve JD: paste, fetch URL, or search title+company.
4. Confirm with user in 4–6 lines: role title, company, seniority signal, must-have count, detected mode. Cheap insurance against parse errors.

For batch mode, read `reference/batch-workflow.md` before continuing.

---

## Phase 1: Profile and JD ingestion

1. Ingest every profile source per `reference/profile-ingestion.md`.
2. Acquire and extract JD per `reference/jd-acquisition.md`: required/preferred quals, responsibilities, level, comp, location/travel/clearance, cultural signals, ATS family hint.
3. Build a **working profile** in scratch notes (identity, production work, customer-facing work, stack, differentiators, education, public artifacts, constraints, user preferences).
4. Produce **honest fit assessment** (strong / moderate-strong / moderate / weak / very weak) with specific gaps. Tell the user before drafting.
5. Produce **gap scorecard**: for each must-have, mark ✅ strong, 🟡 adjacent, ❌ no evidence. Show the table to the user.

If fit is weak or very weak, recommend proceed / different role / cover letter bridge. Respect the user's choice.

---

## Phase 1.5: Targeted discovery (conditional)

Run when:
- Any 🟡 on the scorecard that the user might be able to fill in.
- Profile is thin (missing achievements, workshops, public work the JD requires).
- Screener would flag "not on resume" for work the user may have done.

**Do not** re-interview the whole career. Cap at **5 focused questions** per session. Use branching patterns in `reference/experience-discovery.md`.

After answers, update the working profile and scorecard. Append durable facts to the user's source material if they maintain a master profile or `content.js`.

Then ask **strategic questions** from `reference/strategic-questions.md` (positioning, emphasis, date overlaps, cover letter). Compile an internal tailoring strategy before Phase 2.

Skip Phase 1.5 in critique-only mode unless gaps block the screener.

---

## Phase 2: Tailored draft + ATS pass

### Draft

Target **1–2 pages** (never 3 unless JD invites CV-style). See `reference/workflow.md` for structure.

- Lead with the **most relevant role**, not necessarily the most recent.
- Use **JD vocabulary** only where work genuinely matches.
- Name **specific tools** in production use; no aspirational skill lists.
- Add **clearance line** for defense/government at the JD's level.
- Drop irrelevant content; match format to audience (eng vs sales vs PMO).
- Write bullets per `reference/bullet-patterns.md`.

### Build and lint

```bash
node scripts/build-resume.js --lint-only   # before declaring draft done
node scripts/build-resume.js               # compile DOCX, PDF, page check, PNG preview
```

### ATS keyword pass

After draft text exists, run the pass in `reference/ats-optimization.md`:

- Match JD must-haves with **exact phrase** where defensible (word order matters for many ATS parsers).
- Plant keywords in summary, skills, and first bullet of lead role.
- Cap each keyword at ~3 appearances; no stuffing.
- Produce a short **ATS keyword report** for the user (coverage %, misses, patches applied).

Re-run linter after patches.

### Compression loop

If page count exceeds target, suggest cuts in priority order (see `reference/workflow.md` compression section). **Ask before cutting**; do not silently delete content.

---

## Phase 3: In-character screener critique

Role-play as the company's hiring screener. Select persona from `reference/screener-personas.md` using JD tone and company type.

**Open with persona declaration**, then:

1. **Verdict at 30 seconds** — forward / borderline / reject.
2. **What works** — 2–4 specific strengths (no generic praise).
3. **What's wrong** — 4–10 specific issues, priority order.
4. **Screen-killer gaps** — what causes a first-pass filter.
5. **What would change my mind** — 1–3 concrete additions or reframes.
6. **Outcome** — language the screener would use to the hiring team.

Stay in character; avoid Claude's voice. Soft critiques waste the loop.

**Batch:** screen each draft individually, then synthesize cross-resume patterns for systemic fixes.

**Critique-only mode:** skip Phase 2; critique the user's existing draft.

---

## Phase 4: Revision pass and delivery

For each screener finding, classify: structural fix, content addition, content removal, or framing change. Apply changes; re-run linter and `build-resume.js`; re-verify page count; spot-check page-1 PNG preview.

Deliver:
- Final DOCX (zip if batch).
- Cover note: fit tier, revision summary, stretch flags, ATS upload tip (.docx for Workday/Taleo-heavy flows).
- Optional: offer cover letter if strategic questions flagged a stretch or mission-driven company.

---

## Hard rules (every output)

Non-negotiable. The screener catches violations; catch them earlier.

1. **No em dashes** — commas, colons, semicolons, periods, or parentheses. See `reference/anti-patterns.md`.
2. **No fabricated metrics** — no invented %, dollars, or counts. Qualitative or structurally verifiable facts only.
3. **No marketing-tone language** — banned list in `reference/anti-patterns.md`.
4. **No overclaimed expertise** — production claims only for production work.
5. **No self-awarded titles** — "AI expert", "thought leader", etc.
6. **Specificity over generality** — named tools, scope, outcomes.
7. **Honest fit first** — weak fit disclosed before tailoring effort.
8. **Match format to audience** — EM wants tools; sales wants accounts; PMO wants EVMS/CAM vocabulary.
9. **Respect candidate preferences** — no GitHub if asked, no dollar amounts if asked, etc.
10. **Preserve markdown/source** — if you emit intermediate `.md` or `content.js`, keep it for diffs and re-tailoring.

---

## Workflow summary

```
Phase 0: Resolve inputs + mode
    ↓
Phase 1: Ingest + fit assessment + gap scorecard
    ↓
Phase 1.5: Targeted discovery + strategic questions (if needed)
    ↓
Phase 2: Tailored draft → lint → ATS pass → build DOCX
    ↓
Phase 3: In-character screener critique
    ↓
Phase 4: Revise → verify → deliver DOCX + cover note
```

## Common failure modes

| Situation | Response |
|-----------|----------|
| Thin profile | Phase 1.5 discovery; do not invent bullets |
| Vague JD | One clarifying question; default to strongest profile section |
| JD fetch fails | Ask for paste; try company careers page |
| Weak fit | Disclose; offer cover letter or different role |
| 3+ page PDF | Compression loop with user approval |
| User draft better than yours | Learn deltas; don't reintroduce fixed problems |
| Multi-job | `reference/batch-workflow.md` — shared discovery, per-role screen |

## Pre-delivery checklist

Run before declaring Phase 4 complete:

- [ ] Linter clean (`build-resume.js --lint-only`)
- [ ] Page count 1–2 (unless CV-style JD)
- [ ] Gap scorecard honest (no ❌ presented as ✅)
- [ ] ATS must-haves addressed or explicitly flagged in cover note
- [ ] Screener critique applied or user declined specific items
- [ ] LinkedIn/resume date alignment checked if LinkedIn was ingested
- [ ] Cover note includes fit tier and stretch flags

See `reference/anti-patterns.md` final checklist for content rules.
