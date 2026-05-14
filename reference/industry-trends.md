# Industry Hiring Trends (2025–2026)

These are patterns the skill should incorporate into draft and critique. Update this file periodically; trends shift faster than skill code.

## ATS systems are still scanning resumes

Applicant tracking systems remain the first pass at most companies above ~50 employees. The implication for resumes:

- Use standard section headers ("Professional Summary", "Experience", "Education") so the parser recognizes them.
- Avoid graphical layouts, columns, and tables. ATS parsers still struggle with these in 2025-2026 despite vendor claims.
- Don't use images for text. Don't use headers / footers for critical content (some parsers miss them).
- Save as `.docx` for upload. PDFs work but `.docx` is the safest cross-platform format.

The skill's default DOCX template is ATS-friendly by design (single column, standard headers, no images, no tables for layout).

## Keyword matching is alive and well

ATS systems still keyword-match JD vocabulary against resume vocabulary. The strategy:

- Echo specific tool names, frameworks, and methodologies that the JD uses.
- Do not echo aspirational tools the candidate hasn't used.
- Don't keyword-stuff. The screener reads after the ATS does.

## AI in hiring

Many companies now use AI to screen resumes. This affects how the screener-pass persona should be calibrated:

- The first reader may be an AI summarizer. Specific facts and verifiable claims survive AI summarization better than vague claims.
- AI screeners do not yet detect marketing tone well; human screeners do. The honest framing still matters because the second reader is human.
- Companies vary widely in disclosure of AI screening. Don't try to game the AI; write for the human.

## Public technical work is a growing differentiator

For engineering / DevRel / dev-tools / AI-deployment roles, evidence of public technical work raises rank significantly:

- Open-source contributions (commits, PRs, issues)
- Technical blog posts, talks, conference appearances
- Open-source side projects with real users
- Documented production systems with public-facing surfaces

If the candidate has any of these, surface them in a "Selected Public Work" section. If the candidate has none, this is a real gap and the screener-pass should flag it.

## Remote-first vs return-to-office split

In 2026 the remote / hybrid / on-site split is firmly back to fully heterogeneous. Each company has its own pattern. The implication:

- Match the resume's stated work-preference to the JD's stated work-location.
- If the JD is on-site and the candidate is remote, the resume should signal willingness to relocate or be on-site.
- "Open to NYC or fully remote" in the contact line addresses this directly.

## Clearance gates are tighter

In defense and federal roles, the clearance bar has tightened. Implications:

- "Willing to apply for and maintain" is acceptable for entry-level / experienced individual contributors.
- For senior IC / manager / director roles, an active clearance is increasingly required.
- The clearance level matters: a Secret-required role won't accept "willing to obtain TS"; phrase it specifically.

## Comp ranges in JDs

US-based JDs now post comp ranges by state law in many jurisdictions. The implication:

- Calibrate resume gravitas to the comp range. A $234K-$260K role expects different scope language than a $90K-$120K role.
- Don't apply to jobs whose comp is far below the candidate's target without acknowledging the gap.

## AI-deployment / AI-platform roles are a category

In 2025-2026, "AI Deployment Engineer", "AI Success Engineer", "AI Solutions Engineer", "Forward Deployed Engineer", "AI Solutions Architect" have emerged as distinct senior roles at AI labs and AI-enabled enterprises. They share traits:

- 5-8 years technical customer-facing
- Production AI deployment experience
- Workshop / training / enablement delivery
- Multi-stakeholder program management
- Specific platform fluency (OpenAI API, Anthropic API, AWS Bedrock, Azure OpenAI, etc.)

For these roles, the screener-pass should specifically check: production agentic system credibility, customer-facing workshop evidence, named industries served, security and compliance fluency.

## Generic backend / frontend roles are still common

Despite AI hype, the most common engineering openings are still generic backend, frontend, and full-stack roles. The implication:

- Don't AI-wash a frontend role. If the JD is React + TypeScript + REST APIs, the resume should foreground that work.
- AI experience is a useful supporting signal; don't make it the whole resume.

## "Senior" inflation

"Senior" has inflated in titles. In 2025-2026, a "Senior Software Engineer" at most companies is 5-7 years of experience. "Staff" is 8-12. "Principal" is 12+.

For roles labeled "Senior" with 8+ year requirements, the role is staff-coded; the resume should reflect staff-level scope.

## Cover letters

Some companies have dropped cover letters; some have reinstated them. The skill produces resumes, not cover letters by default. But:

- If the candidate is a stretch on a role, recommend a cover letter to bridge the gap.
- If the candidate is mission-aligned with a mission-driven company, recommend a cover letter to demonstrate it.
- For frontier AI labs and defense companies, cover letters are still often valuable.

## Resume length

The "one-page resume" myth is gone for experienced candidates. The new norms:

- 0-3 years experience: 1 page.
- 3-10 years experience: 1-2 pages.
- 10+ years or senior roles: 2 pages.
- Principal / Distinguished: 2-3 pages.
- Academic / CV-style: as long as the work warrants.

Two pages is the safe default for most experienced candidates.

## Font and layout choices

Calibri or other modern sans-serif (Helvetica, Inter, Source Sans) is standard. Avoid Times New Roman unless the field is academic / legal. Avoid Arial, it reads as old-corporate. The skill's default is Calibri.

Modest accent color (a single accent for headers, no rainbow) is acceptable. The skill's default is a muted blue.

## Specific things 2025-2026 hiring managers notice

- AI usage in writing the resume itself. Resumes with strong AI-generated cadence ("I am thrilled to apply...", "I am passionate about...", long lists of empty intensifiers) get flagged as low-effort. Write like a human; if using AI assistance, edit for voice.
- LinkedIn / GitHub mismatch with resume. If the candidate's LinkedIn shows different titles or dates, the resume gets flagged. Verify alignment.
- Vague "led" / "drove" / "owned" verbs without scope. Replace with specific verbs and named scope.
- Bullets that all start with the same verb. Vary the verbs.

## Trends specific to AI / ML hiring

- Power-user-of-AI-tools claims now require evidence. "Daily user of Claude Code, Cursor, Windsurf" plus deeply customized workflow detail beats generic AI-tool mentions.
- Open-source LLM stack credibility ("Ollama, OpenWebUI, MLX, GGUF quantization") differentiates from candidates who only use frontier APIs.
- Multi-model evaluation experience is increasingly important for AI-deployment roles.
- RLHF / RL claims are heavily scrutinized. Don't claim unless real.
- Production-AI-with-paying-users is the strongest credibility signal an AI resume can carry.

Update this file as trends shift.
