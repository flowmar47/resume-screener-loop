---
name: resume-screener-loop
description: Tailor a resume for a specific job, then role-play as the company's hiring screener to critique the resume, then apply the critique in a final revision pass. Use whenever the user asks to tailor, customize, or rewrite a resume for a specific role, company, or job description, especially when they want honest critique before finalizing. Triggers include phrases like "tailor my resume for [role]", "rewrite for this JD", "screen and improve my resume", "would a recruiter pass this", or "apply for [role] at [company]". Accepts profile inputs in any form (existing resume, portfolio site, project READMEs, code repositories, LinkedIn or Indeed profile pages, supporting documents) and a job spec in any form (full JD, JD URL, or just a role title plus company, in which case search for the JD). Produces an honest fit assessment, a tailored draft, an in-character screener critique, and a revised final DOCX.
---

# Resume Screener Loop

A four-phase workflow for producing a tailored resume that survives recruiter and hiring-manager scrutiny. The loop uses adversarial self-review: after building the draft, Claude role-plays as the company's hiring screener and critiques the resume before applying the findings in a final pass.

## When to use this skill

Trigger this skill whenever the user asks to tailor a resume for a specific role, especially when they want a defensible result rather than a marketing piece. The skill is suitable for:

- Single-role tailoring (one resume for one JD)
- Batch tailoring (many roles in one session)
- Pure critique (the user already has a draft and wants the screener-pass critique applied)

Do not trigger for unrelated resume tasks like format conversion, contact info updates, or generic resume writing without a target role.

## Required inputs

Before starting, gather both halves of the input pair:

**Profile inputs**, any combination of:
- An existing resume (DOCX, PDF, plain text, or pasted content)
- A portfolio site, personal site, or business site (fetch with `web_fetch`)
- Project READMEs (read directly if provided; fetch from GitHub if a repo URL is provided)
- Code or document samples that demonstrate skill (read directly)
- LinkedIn, Indeed, or other job-application profile pages (fetch the URL)
- Supporting documents (certifications, transcripts, project descriptions)

**Job inputs**, any of:
- The full JD as pasted text
- A JD URL (fetch with `web_fetch`)
- A title plus company (search for the JD with `web_search`, then fetch the most relevant result)

If profile inputs are thin, ask the user to provide more before proceeding. If the job is unclear, ask for a JD URL or paste before proceeding. Do not proceed on assumptions; the entire workflow depends on accurate inputs.

## The four phases

### Phase 1: Profile and JD ingestion

1. Read every profile input the user has supplied. If a site is supplied, `web_fetch` it. If a GitHub repo is named, fetch the README and any relevant files.
2. Synthesize the candidate's profile into a working set: identity (name, location, contact), production work with operational stakes, technical skills with named tools, education, credentials, public-facing artifacts, and any cross-domain differentiators.
3. Read the JD. Extract: required qualifications (hard filters), preferred qualifications (soft filters), responsibilities (what they actually want done), level signal (IC vs lead vs principal), comp range, location/travel/clearance requirements, and explicit company-culture signals.
4. Produce an honest fit assessment before writing anything. Score strong / moderate-strong / moderate / weak / very weak, and name the specific gaps that drove the score. If fit is weak or worse, tell the user so they can choose whether to proceed.

See `reference/profile-ingestion.md` and `reference/jd-acquisition.md` for the full ingestion checklist.

### Phase 2: Tailored draft

Build the resume to a target of two pages (1–2 pages, never 3 unless the JD explicitly invites a CV-style submission). Follow the structural rules:

- **Lead with the most relevant role** for this JD, not chronologically. If the candidate's most-recent role is less relevant than an earlier role, foreground the earlier role.
- **Use JD vocabulary** in bullets where the candidate's work genuinely matches. Echoing JD language helps both ATS and human readers, but never claim work the candidate hasn't done.
- **Name specific tools, frameworks, and languages** in production use. Avoid aspirational skill listings.
- **Include a clearance line** for defense / government roles, matched to the level the JD requires (Secret, Top Secret, etc.).
- **Drop irrelevant content.** A backend SE resume shouldn't carry sales-AE bullets; an instructional-design resume shouldn't lead with embedded ML.
- **Run the automated anti-pattern linter** before declaring the draft done by running `node scripts/build-resume.js --lint-only` to scan for em-dashes, double-hyphens, and AI clichés ("leveraged", "delved", "tapestry"). See `reference/anti-patterns.md` for full guidelines.

Generate and compile the DOCX using the templates in `templates/` and the automated compiler script: `node scripts/build-resume.js`. The builder compiles the DOCX, converts to PDF using headless LibreOffice, and automatically runs constraints verification.

### Phase 3: In-character screener critique

This is the differentiating phase of the loop. Claude role-plays as the company's hiring screener and reads the draft as that person would.

The persona is specific:
- A frontier AI lab recruiter screens differently from a defense TPM hiring manager who screens differently from an enterprise sales lead.
- See `reference/screener-personas.md` for archetype guidance.

The critique is honest and direct:
- State the verdict in plain language: forward, borderline, or reject.
- Name specific things that work and specific things that don't.
- Name screen-killer gaps (the things that cause a recruiter to filter at first read).
- Avoid generic praise. Avoid generic criticism. Be the screener.

When tailoring for multiple roles in one session, screen each draft individually before synthesizing patterns. Patterns surfaced across resumes often point to systemic improvements that no single screen would catch.

### Phase 4: Revision pass

Apply the screener's findings.

- For each finding, decide: is this a structural fix to the resume, a content addition, a content removal, or a framing change?
- Apply the changes. Re-run the automated anti-pattern check and compile using `node scripts/build-resume.js`.
- Re-verify page count (aim for two pages; tighten if the compiler raises a page count warning).
- Spot-check the rendered page 1 PNG preview generated by the compiler.

Deliver the final DOCX (and a zip if multiple resumes). Include a brief cover note summarizing fit tier, what changed in the final pass, and any honest stretch flags.

## Hard rules: apply on every output

These are non-negotiable. The screener will catch any violation; better to catch them in the draft.

1. **No em dashes.** Replace with commas, colons, semicolons, periods, or parentheses. See `reference/anti-patterns.md` for the substitution table.
2. **No fabricated numbers or metrics.** Never invent percentages, dollar figures, user counts, or performance metrics. Use qualitative phrasing or structural facts ("multiple API sources", "strict daily SLA") that the candidate can defend if asked "how did you measure that?"
3. **No marketing-tone language.** Banned: "world-class", "best-in-class", "passionate about", "thrilled to", "incredibly excited", "transformed", "revolutionized", "game-changing", "thought leader", "AI expert", "groundbreaking", "cutting-edge".
4. **No overclaimed expertise.** Don't claim production C/C++ when the candidate has Python + Swift; don't claim RLHF when the candidate has prompt-tuning. The screener will catch the bluff; bluffing on a resume is worse than honest gaps.
5. **No self-awarded titles.** "Daily power user" is acceptable when accompanied by tools listed; "AI expert" is not.
6. **Specificity over generality.** "Cross-functional teams of 15+" is concrete and verifiable; "led large teams" is vague.
7. **Honest fit assessment first.** If the role is a stretch, tell the user before investing tailoring effort. Some applications shouldn't be sent.
8. **Match the format to the audience.** Engineering managers want lists of named tools. Sales leaders want named accounts. PMOs want CAM/EVMS vocabulary. Don't write one template and submit it everywhere.
9. **Respect candidate preferences.** If the candidate has said "no GitHub on the resume" or "no specific dollar amounts", obey. The skill's job is to follow the candidate's rules, not impose its own.

## Workflow summary

```
Inputs → Phase 1 (ingest + fit assessment) → Phase 2 (tailored draft)
                                                     ↓
                                          Phase 3 (in-character screen)
                                                     ↓
                                          Phase 4 (revise + verify)
                                                     ↓
                                              Final DOCX + cover note
```

Read the supporting docs in `reference/` for the detailed checklists. Use the templates in `templates/` to build the DOCX. Look at `examples/` for a worked walkthrough.
