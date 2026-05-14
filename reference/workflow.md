# Workflow: The Four Phases In Detail

Use this when SKILL.md's summary isn't enough.

## Phase 1: Profile and JD ingestion

### Profile ingestion checklist

Run through every source the user has provided:

1. **Existing resume.** Read it cover to cover. Note: identity (name, location, contact, links), every role with dates and scope, every project, every skill, education, credentials. Note also: the existing voice (formal? casual? technical? marketing-tone?) and any anti-patterns already present.

2. **Portfolio / personal site / business site.** `web_fetch` it. Read the about page, the work / services page, the methodology page. Pull: founding date, integrated brand framing, named methodologies or programs, technical stack mentioned in public copy, named differentiators.

3. **Project READMEs.** Read in full if they're attached. If a GitHub repo is named, `web_fetch` the README (note: GitHub READMEs sometimes need the raw URL). Extract: real stack (languages, frameworks, versions), real architecture, real deployment story, real shipping discipline (CI, packaging, distribution).

4. **Code or document samples.** Skim for: complexity of work, named tools, named libraries, evidence of senior-level patterns (testing, observability, error handling).

5. **LinkedIn / Indeed profile pages.** `web_fetch` if a URL is given. Cross-check titles, dates, and scope statements against the resume.

6. **Supporting documents.** Read certifications, transcripts, project descriptions for additional credentials or coursework that could matter for the target JD.

### JD acquisition

If the user provides:
- **Full JD text:** read it.
- **JD URL:** `web_fetch` it. Read the resulting page in full.
- **Title + company only:** `web_search` for "{Company} {Title} careers" or "{Company} jobs {Title}". Fetch the most relevant result. Confirm the listing is current.
- **Just a title:** ask the user which company. Don't guess.

### JD extraction

From the JD, extract and write down (in working notes, not on the resume):

- **Required qualifications**, these are hard filters. The candidate must clear each one or have a defensible substitute.
- **Preferred qualifications**, these are soft filters. Each one met raises the ranking.
- **Responsibilities**, what the role actually does day-to-day. Tailor bullets to mirror these.
- **Level signal**, IC, senior IC, staff, principal, manager, director. The resume must match this level in scope language.
- **Compensation range**, informs how much gravitas the resume needs.
- **Location, travel, clearance**, non-negotiable inputs. Add a clearance line if the JD requires one.
- **Cultural signals**, values, mission language, repeated themes. For mission-driven companies (frontier AI labs, defense, healthcare), align the summary tone.

### Honest fit assessment

Before writing anything, score the candidate's fit against the JD's required and preferred quals. Use a five-tier scale:

| Tier | Meaning |
|---|---|
| **Strong** | Meets or exceeds all required quals plus most preferred quals. Submit. |
| **Moderate-strong** | Meets all required quals plus some preferred quals. Submit with confidence. |
| **Moderate** | Meets all required quals with at least one defensible adjacency for any borderline quals. Submit. |
| **Weak** | One required qual is unmet with no defensible substitute, or multiple preferred quals are missing. Flag to the user; submit only if they want to. |
| **Very weak** | Multiple required quals unmet. Flag clearly; recommend a different role at the same company. |

**Tell the user the score before tailoring.** If they want to proceed on weak / very weak fit, fine, but they should know.

## Phase 2: Tailored draft

### Structure choices

Order experience by relevance to the JD, not by date. Recent + relevant is best; older + relevant beats recent + irrelevant. Pick the most-relevant role to lead.

### Section order options

Default order:
1. Name + contact (top of page)
2. Professional Summary (4-6 sentences)
3. Relevant Experience (bulk of the resume)
4. Selected Technical Skills (categorized; 3-5 categories)
5. Selected Public Work / Selected Projects (for customer-facing or engineering roles)
6. Clearance & Eligibility (if defense / government)
7. Education

For credentials-heavy roles (academic, government, regulated): consider putting Education earlier.

For sales / customer-facing roles: consider a "Selected Engagements" or "Customer Outcomes" section.

For engineering roles: lead with experience; skills come after.

### Summary writing

A good summary is 4-6 sentences that:
1. State years of experience and primary discipline.
2. Name the differentiating production work (a system, a portfolio, a track record).
3. Name 2-3 specific tools or domains relevant to the JD.
4. Close with a constraint statement that pre-answers a screener's question (clearance, travel, remote / hybrid willingness, language fluency).

Avoid: opening with "I am passionate about...". Avoid: claiming "X years of experience in Y" if X is less than the JD requires (be honest).

### Bullets

- Start with a strong action verb: Built, Designed, Operate, Lead, Architect, Coordinate, Ship, Deliver, Maintain.
- Name specific tools, frameworks, and methodologies actually used.
- Include scope when honest: "cross-functional teams of 15+", "concurrent multi-year engagements", "production system with paying users".
- Avoid passive voice unless it improves clarity.
- Bullets should be 1-3 lines each. Avoid one-line bullets that say nothing; avoid five-line bullets that read as paragraphs.

### Skill section

Group into 3-5 categories, named after what the screener will look for:
- "LLM & Agentic Systems"
- "Engineering Stack"
- "Customer-Facing Delivery"
- "Linux Systems"
- "AI Coding Tools"

Inside each category, list 5-15 specific items separated by commas. Don't list aspirational skills.

### DOCX generation

Use the template in `templates/lib.js` plus `templates/resume-template.js`. See `templates/README.md` for usage.

## Phase 3: In-character screener critique

### Set the persona

Before reading the draft, declare the persona out loud: "Hiring agent at {Company}, screening for {Role}. Bar: {summary of what they want}. Reading this resume as that person."

The persona is specific to the role:
- Frontier AI lab recruiter → screens for production-AI credibility, public work, mission alignment.
- Defense TPM hiring manager → screens for cleared work, multi-stakeholder execution, government-customer interfaces.
- Enterprise sales VP → screens for named accounts, quota attainment, executive presence.
- Startup CTO → screens for shipped products, full-stack chops, end-to-end ownership.
- Manufacturing director → screens for aerospace / regulated manufacturing experience, span of control, safety record.

See `screener-personas.md` for the full archetype list.

### Critique structure

For each resume, write:

1. **Verdict at 30 seconds.** Forward / borderline / reject. State this first.
2. **What works.** 2-4 specific things that land. Avoid generic praise.
3. **What's wrong.** 4-10 specific things, in priority order. Be the screener: harsh, specific, and accurate.
4. **What would change my mind.** 1-3 things the candidate could add or change.
5. **Outcome.** Forward, forward-flagged, borderline-hold, or reject.

### Honest critique discipline

The critique is the value of the loop. Soft critiques lead to resumes that fail in real screens. Be hard on the draft.

Specific things to look for:
- Years-of-experience requirements: does the resume cleanly state the years the JD requires?
- Required language requirements: if the JD requires C / C++ / Go / Rust, is it in the resume as production work, not "comfortable reading"?
- Clearance: is it stated at the right level?
- Domain crossover: if the candidate is pivoting fields, is there a bridge sentence?
- Customer logos / industries: for customer-facing roles, is segment specificity present?
- Public technical content: for engineering / dev-tools / DevRel roles, is there evidence of public-facing work?
- Mission alignment: for mission-driven companies, is there any signal of why this company specifically?
- Founder-title overload: too many founder roles?
- Marketing-tone bleed: any banned phrasing leaked in?

### When tailoring multiple resumes in one session

Screen each individually. Then write a synthesized findings section that surfaces patterns across the drafts. These patterns often reveal systemic improvements that no single screen would catch.

## Phase 4: Revision pass

### Apply the findings

For each finding from Phase 3, decide:
- **Structural fix.** Reorder sections, move a role earlier, drop a section.
- **Content addition.** Add a bullet, a sentence, a skill line, a clearance line.
- **Content removal.** Drop a marketing-tone phrase, a fabricated metric, an irrelevant section.
- **Framing change.** Replace a self-referential claim with a description of the work.

### Re-verify

After revision:
- Run the anti-pattern checklist again.
- Build the DOCX and verify page count (PDF render via LibreOffice headless is the most reliable way; `pdfinfo` for page count).
- Spot-check one or two PDFs visually for layout.

### Deliver

Provide:
- The final DOCX (and a zip if multiple).
- A cover note summarizing fit tier per resume, what changed in the final pass, and any honest stretch flags the user should know.

The cover note is part of the deliverable. It's where the honest fit assessment lives in writing.
