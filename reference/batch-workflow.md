# Batch Workflow (Multiple Roles)

Use when Phase 0 detects **2+ target roles** in one session. Preserves the screener loop **per role** while sharing expensive upstream work.

## Detection triggers

- Multiple JD URLs or pasted JDs
- Phrases: "batch tailor", "multiple jobs", "these 3 roles", "apply to all of these"
- List of company/role pairs

Confirm with user:

```
"I see {N} target roles. Batch mode shares profile ingestion, gap analysis, and discovery,
then tailors + screens each role separately. Proceed? (Y/N)"
```

## Architecture

```
SHARED: Phase 0 → Phase 1 (all JDs) → aggregate gap map → Phase 1.5 (once)
PER ROLE: Phase 2 → Phase 3 → Phase 4
FINAL: cross-role pattern summary + zip of DOCXs
```

## Phase 0–1 (shared)

1. Ingest profile once; build one working profile.
2. For each JD: extract must-haves, preferred, level, ATS hint. Assign `role-slug` (e.g. `openai-codex-de`, `anthropic-de`).
3. **Aggregate gap map:** union all must-haves across JDs. Tag each gap with job IDs where it appears.

Example:

| Requirement | Jobs | Profile | Status |
|-------------|------|---------|--------|
| Workshop delivery | 2/3 | Internal only | 🟡 |
| Public technical writing | 3/3 | Site only | 🟡 |
| Kubernetes production | 1/3 | None | ❌ (job-specific) |

4. Prioritize discovery:
   - **HIGH leverage:** gap in 3+ jobs
   - **MEDIUM:** 2 jobs
   - **LOW:** 1 job (handle in that role's draft only)

5. Single fit assessment **per role**; do not average into one score.

## Phase 1.5 (shared discovery)

- One discovery session, max **5 questions**, prioritized by leverage.
- Tag answers: "applies to jobs: A, B".
- Update working profile once.

## Per-role Phases 2–4

For each `role-slug`:

1. **Phase 2:** Role-specific draft from shared `content.js` with role variant bullets; ATS pass against **that** JD only; build `Resume_<Name>_<Company>_<slug>.docx`.
2. **Phase 3:** Individual screener critique with correct persona per company.
3. **Phase 4:** Revise; verify; add to deliverables list.

Reuse `content.js` + separate `build_<slug>.js` per role (see `templates/content-template.js`).

## Cross-role synthesis (after all screens)

After individual critiques, write a short **pattern summary**:

```markdown
## Cross-role findings

Patterns across {N} resumes:
1. [Systemic issue, e.g. workshop evidence missing everywhere]
2. [Framing that worked in 2/3 screens]
3. [One role-specific stretch to avoid applying to]

Recommended profile updates for next batch:
- [Add to content.js / master profile]
```

This catches improvements no single-role screen would surface.

## Working directory layout

```
batch_<YYYY-MM-DD>/
├── content.js                 # shared candidate facts
├── build_<role-slug-1>.js
├── build_<role-slug-2>.js
├── jd_<role-slug-1>.txt       # optional saved JDs
├── Resume_*_<slug-1>.docx
├── Resume_*_<slug-2>.docx
└── batch_cover_notes.md
```

## Time discipline

- Do not skip per-role Phase 3 to save time; it is the skill's core value.
- Shared discovery should not exceed 5 questions unless user opts in.
- Express mode: user may waive strategic questions but not fit assessment or screener pass.

## Deliverables

- Zip of final DOCXs
- Per-role cover notes (or one doc with sections)
- Aggregate gap map + cross-role pattern summary
- Optional: per-role ATS keyword reports
