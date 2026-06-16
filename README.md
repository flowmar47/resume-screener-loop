# resume-screener-loop

A Claude skill that tailors a resume for a target job, runs an ATS keyword pass, role-plays as the company's hiring screener to critique the draft, then applies the critique in a final revision pass.

Most resume-tailoring tools optimize for keyword matching. This skill adds what candidates often skip: an **honest gap scorecard**, **targeted experience discovery** when the profile is thin, and an **adversarial screener review** calibrated to the target company's hiring archetype. Findings feed a revision pass so the final DOCX is more defensible in real screens.

Inspired by patterns in popular open-source resume skills (gap scorecards, branching discovery, ATS phrase matching, batch tailoring, strategic positioning questions) while keeping this skill's core differentiator: the in-character screener loop.

## What it does

Given:
- A candidate profile in any form (existing resume, portfolio site, project READMEs, code samples, LinkedIn / Indeed profile, supporting documents)
- A target job in any form (full JD, JD URL, or title + company to search)

The skill produces:
1. An honest **fit assessment** and **gap scorecard** before any writing happens
2. Optional **targeted discovery** (up to 5 questions) for adjacent gaps
3. A tailored **DOCX** draft (ATS-friendly, 1–2 pages)
4. An **ATS keyword report** (coverage, patches, remaining honest gaps)
5. An **in-character screener critique**, calibrated to the company's hiring archetype
6. A **revised final DOCX** with the critique applied
7. A **cover note** summarizing fit tier, changes, stretch flags, and upload guidance

### Operating modes

| Mode | Use case |
|------|----------|
| **Full loop** | Default: tailor → ATS pass → screen → revise |
| **Batch** | Multiple roles: shared ingestion/discovery, per-role screen |
| **Critique-only** | Existing draft → screener → optional revise |
| **Screen-only** | Screener verdict without full rewrite |

## The hard rules

The skill enforces these on every output:

- No em dashes anywhere (replaced with commas, colons, semicolons, periods, or parentheses)
- No fabricated metrics or percentages (every numeric claim must survive "how did you measure that?")
- No marketing-tone language ("world-class", "passionate about", "thrilled to", "thought leader", etc.)
- No overclaimed expertise (no production C / C++ unless real; no RLHF unless real)
- Specificity over generality (named tools, named scope, named outcomes)
- Honest fit assessment and gap scorecard before tailoring
- Respect for candidate preferences (no GitHub on resume if asked, etc.)

See [`reference/anti-patterns.md`](reference/anti-patterns.md) for the full enforcement checklist.

## Installation

Drop this folder into your Claude skills directory:

```bash
git clone https://github.com/flowmar47/resume-screener-loop.git
cp -r resume-screener-loop ~/.claude/skills/
# or wherever your Claude environment loads user skills from
```

In environments using SKILL.md auto-discovery (Claude Code with a `skills/` folder, Claude Apps with user skills, the Agent Skills standard), the skill triggers automatically on relevant requests.

## Manual use (without skill auto-loading)

You can also use this as a workflow reference outside the skill system. The methodology, templates, and reference docs are usable directly:

```bash
# In the repository root, install dependencies:
npm install

# Set up your working directory
mkdir resumes && cd resumes

# Copy the templates
cp ../templates/lib.js .
cp ../templates/content-template.js ./content.js
cp ../templates/resume-template.js ./build_target_role.js

# Edit content.js and build_target_role.js with your material

# Lint anti-patterns only
node ../scripts/build-resume.js --lint-only

# Optional: check JD keyword coverage against content.js
node ../scripts/check-keywords.js --jd ../path/to/jd.txt --content content.js

# Full build: lint, DOCX, PDF, page count, PNG preview
node ../scripts/build-resume.js
```

The build pipeline lints for em-dashes and AI clichés, compiles `.docx`, converts to PDF via headless LibreOffice, verifies 1–2 page count with `pdfinfo`, and generates a page-1 PNG preview.

See [`templates/README.md`](templates/README.md) for the full build pipeline.

## Repository structure

```
resume-screener-loop/
├── SKILL.md                     # Main entry point: phases, modes, output contract
├── README.md                    # This file
├── LICENSE                      # MIT
├── package.json
├── scripts/
│   ├── build-resume.js          # Lint, compile DOCX, PDF verify, preview
│   └── check-keywords.js        # ATS phrase coverage helper
├── reference/
│   ├── workflow.md              # Phase detail (0–4)
│   ├── gap-scorecard.md         # JD vs profile table + fit mapping
│   ├── experience-discovery.md  # Branching questions (max 5/session)
│   ├── strategic-questions.md # Positioning before draft
│   ├── ats-optimization.md    # ATS family hints + keyword pass
│   ├── bullet-patterns.md       # Bullet shapes and verbs
│   ├── batch-workflow.md        # Multi-role sessions
│   ├── anti-patterns.md         # Hard rules
│   ├── screener-personas.md     # In-character screener archetypes
│   ├── industry-trends.md       # 2025–2026 hiring trends
│   ├── profile-ingestion.md     # Profile intake
│   └── jd-acquisition.md        # JD fetch and parse
├── templates/
│   ├── README.md
│   ├── lib.js
│   ├── content-template.js
│   └── resume-template.js
└── examples/
    └── walkthrough.md           # Full loop on a fictional candidate
```

## The workflow (phases 0–4)

### 0. Resolve inputs and mode

Confirm role, company, seniority, and single vs batch vs critique-only.

### 1. Profile and JD ingestion

Read profile sources, fetch JD, extract requirements, produce **fit tier** and **gap scorecard**.

### 1.5. Targeted discovery (conditional)

Up to 5 branching questions for 🟡 gaps; strategic positioning questions; internal tailoring strategy.

### 2. Tailored draft + ATS pass

Role-ordered content, bullet patterns, linter, keyword pass, DOCX build, compression loop if needed.

### 3. In-character screener critique

Persona-matched verdict: what works, what's wrong, screen-killers, what would change the screener's mind.

### 4. Revision and delivery

Apply critique, re-verify, deliver DOCX + cover note (zip if batch).

See [`SKILL.md`](SKILL.md) for the canonical spec or [`reference/workflow.md`](reference/workflow.md) for extended detail.

## Honest stretch flagging

The fit assessment and gap scorecard are part of the deliverable, not an afterthought. If the candidate is a weak or very weak fit, the skill says so and recommends a different role, a cover letter bridge, or not applying. Some applications should not be sent; the skill makes that visible.

## When not to use this skill

- Format conversion only (DOCX → PDF, reformatting without a JD)
- Generic resume writing without a target role
- LinkedIn profile rewrites
- Cover letters as the primary deliverable (offer as optional add-on)

## Why this exists

Resume tailoring tools have proliferated. Most keyword-match against the JD. Real hiring screeners look for credibility, structural fit, and red flags. The **screener-pass** step is the missing layer between "tailored for the JD" and "would survive a recruiter screen." This release adds **gap scorecards**, **ATS phrase alignment**, and **batch/discovery** patterns from the best open-source resume skills without dropping that adversarial core.

## Contributing

PRs welcome for:
- Additional screener archetypes (`reference/screener-personas.md`)
- Updates to industry hiring trends (`reference/industry-trends.md`)
- Anti-pattern and ATS rule refinements
- Build pipeline and keyword checker improvements (`scripts/`)

Please don't PR worked examples; the `examples/` directory uses fictional candidates by design.

## License

MIT. See [`LICENSE`](LICENSE).
