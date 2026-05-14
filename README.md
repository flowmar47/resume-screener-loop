# resume-screener-loop

A Claude skill that tailors a resume for a target job, then role-plays as the company's hiring screener to critique the resume, then applies the critique in a final revision pass.

Most resume-tailoring tools optimize for keyword matching. This skill adds a step most candidates would benefit from: an adversarial self-review by an in-character hiring screener calibrated to the target company. Findings from the screener pass feed back into a revision pass, producing a more defensible final draft.

## What it does

Given:
- A candidate profile in any form (existing resume, portfolio site, project READMEs, code samples, LinkedIn / Indeed profile, supporting documents)
- A target job in any form (full JD, JD URL, or title + company to search)

The skill produces:
1. An honest fit assessment before any writing happens
2. A tailored DOCX draft (ATS-friendly, 1-2 pages)
3. An in-character screener critique, calibrated to the company's hiring archetype
4. A revised final DOCX with the critique applied
5. A cover note summarizing fit tier, what changed, and any honest stretch flags

## The hard rules

The skill enforces these on every output:

- No em dashes anywhere (replaced with commas, colons, semicolons, periods, or parentheses)
- No fabricated metrics or percentages (every numeric claim must survive "how did you measure that?")
- No marketing-tone language ("world-class", "passionate about", "thrilled to", "thought leader", etc.)
- No overclaimed expertise (no production C / C++ unless real; no RLHF unless real)
- Specificity over generality (named tools, named scope, named outcomes)
- Honest fit assessment before tailoring
- Respect for candidate preferences (no GitHub on resume if asked, etc.)

See [`reference/anti-patterns.md`](reference/anti-patterns.md) for the full enforcement checklist.

## Installation

Drop this folder into your Claude skills directory:

```bash
git clone https://github.com/flowmar47/resume-screener-loop.git
cp -r resume-screener-loop ~/.claude/skills/
# or wherever your Claude environment loads user skills from
```

In environments using SKILL.md auto-discovery (Claude Code with a `skills/` folder, Claude Apps with user skills, the Anthropic Skills system), the skill triggers automatically on relevant requests.

For Anthropic's main Claude products, this skill currently runs in environments that support filesystem-based user skills. Future Anthropic products may surface skills differently; check current documentation.

## Manual use (without skill auto-loading)

You can also use this as a workflow reference outside the skill system. The methodology, templates, and reference docs are usable directly:

```bash
# Set up a working directory
mkdir my_resume_project && cd my_resume_project

# Copy the templates
cp /path/to/resume-screener-loop/templates/lib.js .
cp /path/to/resume-screener-loop/templates/content-template.js ./content.js
cp /path/to/resume-screener-loop/templates/resume-template.js ./build_target_role.js

# Install docx-js
npm install docx --global

# Edit content.js with your actual material
# Edit build_target_role.js with the role-specific composition

# Build
NODE_PATH=$(npm root -g) node build_target_role.js
```

See [`templates/README.md`](templates/README.md) for the full build pipeline.

## Repository structure

```
resume-screener-loop/
├── SKILL.md                     # Main entry point, the workflow Claude reads
├── README.md                    # This file
├── LICENSE                      # MIT
├── reference/
│   ├── workflow.md              # The 4-phase workflow in detail
│   ├── anti-patterns.md         # Hard rules of what not to write
│   ├── screener-personas.md     # How to role-play as hiring screener by company archetype
│   ├── industry-trends.md       # 2025-2026 hiring trends to incorporate
│   ├── profile-ingestion.md     # How to gather profile inputs
│   └── jd-acquisition.md        # How to find / fetch JDs
├── templates/
│   ├── README.md                # Build pipeline guide
│   ├── lib.js                   # docx-js helpers (Calibri, ATS-friendly)
│   ├── content-template.js      # Composable content blocks pattern
│   └── resume-template.js       # Per-resume builder template
└── examples/
    └── walkthrough.md           # Full 4-phase loop on a fictional candidate
```

## The four phases

### 1. Profile and JD ingestion

Read every profile input. Fetch any URLs. Extract the candidate's working profile. Acquire the JD (paste, URL, or search). Extract the JD's required quals, preferred quals, responsibilities, level, comp, location, travel, clearance, and cultural signals. Produce an honest fit assessment.

### 2. Tailored draft

Build a 1-2 page DOCX. Order experience by relevance, not date. Use JD vocabulary in bullets where the candidate's work genuinely matches. Name specific tools and frameworks. Run the anti-pattern checklist before declaring the draft done.

### 3. In-character screener critique

Role-play as the company's hiring screener. Frontier AI lab recruiters screen differently from defense TPM hiring managers from enterprise sales VPs from manufacturing directors. State the verdict, name what works, name what's wrong, name what would change the screener's mind.

### 4. Revision pass

Apply the findings. Re-run the anti-pattern checklist. Re-verify page count. Spot-check the rendered PDF. Deliver the final DOCX with a cover note.

See [`SKILL.md`](SKILL.md) for the full workflow specification or [`reference/workflow.md`](reference/workflow.md) for the detailed walkthrough.

## Honest stretch flagging

The fit assessment is part of the deliverable, not an afterthought. If the candidate is a weak or very weak fit, the skill will say so and recommend either a different role at the same company or a stronger cover letter to bridge the gap. Some applications shouldn't be sent. The skill makes that visible.

## When not to use this skill

- For format conversion (DOCX → PDF, resume reformatting): use a dedicated tool.
- For generic resume writing without a target role: this skill needs a JD to operate.
- For LinkedIn profile rewrites: this skill targets resumes specifically.
- For cover letters: this skill produces resumes; cover letters are a separate workflow.

## Why this exists

Resume tailoring tools have proliferated. Most are keyword-matching against the JD. Real hiring screeners do more than match keywords; they look for credibility signals, structural fit, and red flags. The screener-pass step is the missing layer between "tailored for the JD" and "would actually survive a recruiter screen."

## Contributing

PRs welcome for:
- Additional screener archetypes (`reference/screener-personas.md`)
- Updates to industry hiring trends (`reference/industry-trends.md`)
- Refinements to anti-pattern enforcement (`reference/anti-patterns.md`)
- Build pipeline improvements (`templates/`)

Please don't PR worked examples; the `examples/` directory uses fictional candidates by design.

## License

MIT. See [`LICENSE`](LICENSE).
