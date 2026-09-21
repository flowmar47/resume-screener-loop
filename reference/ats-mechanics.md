# ATS Mechanics: What Actually Happens to an Uploaded Resume

Most resume advice about applicant tracking systems is folklore. This file records what vendors document, as of September 2026, so the skill optimizes for real failure modes. Each claim is tagged: **documented** (vendor documentation or primary source), **reported** (credible secondary reporting), or **folklore** (widely repeated, contradicted by documentation).

## 1. Parsing, ranking, and rejection

**Folklore: "75% of resumes are auto-rejected by the ATS before a human sees them."** No major vendor documents a numeric match-score rejection threshold, and several document the opposite:

- Greenhouse: Talent Matching "does not auto-reject or auto-advance any candidate"; AI "doesn't rate candidates and doesn't decide which applications get seen." (documented: support.greenhouse.io Talent Matching FAQ; my.greenhouse.com "How does Greenhouse use AI")
- Ashby: AI-Assisted Application Review evaluates per criterion as Meets / Does not meet / Uncertain and explicitly does not aggregate into an applicant-level score for ranking. (documented: ashbyhq.com product update; 2024 third-party bias audit)
- Eightfold: ranks by match score but "will never remove an applicant from a position based on their Match Score." (documented: eightfold.ai NYC Local Law 144 disclosure)
- Workday and HiredScore: A/B/C/D grading is prioritization; advancing or rejecting is a recruiter action, individually or in bulk. (documented: doc.workday.com HiredScore reference)

**What does auto-reject: knockout questions.** Structured application answers (work authorization, location, years, required license or clearance, salary expectations) drive automatic disqualification in Taleo (disqualification questions), SmartRecruiters (knockout questions), Lever (automation on custom question responses), BambooHR (disqualifying questions), and Paradox (conversational screening that "dispositions" candidates). (documented: each vendor's help center.) The resume's job is to make those answers consistent with what the candidate enters on the form.

**Recruiter keyword search is the second real filter.** Recruiters search the candidate database by terms and Boolean strings. A skill under a different name than the one they type is invisible. This is why the JD's exact wording matters, and why an acronym and its expansion both belong on the page when either might be searched.

**Configured workflows still reject people.** Surveys report that many employers let AI or automation reject candidates before human review (reported: HR Executive, 2025). That is customer-configured knockout and bulk-disposition logic, not a vendor-shipped similarity score. The two claims are not in conflict; folklore collapses them.

## 2. Who parses what

| ATS | Parser | LLM features (2025-2026) |
|---|---|---|
| Workday | in-house engine | skill extraction on apply; HiredScore insights; Document Intelligence (documented) |
| Greenhouse | undisclosed | Talent Matching categories, AI note-taking (documented) |
| Lever | undisclosed | Fast Resume Review queue ordering (marketing-level) |
| Ashby | undisclosed extraction; in-house LLM evaluation | per-criterion evaluation, Talent Rediscovery (documented) |
| iCIMS | Daxtra as marketplace partner; native parser unconfirmed | Copilot, Candidate Summary Agent (documented) |
| Oracle Taleo | unnamed third party | prescreening questionnaires with disqualifiers (documented) |
| SAP SuccessFactors | Textkernel (documented, SAP Help Portal) | partner add-ons |
| SmartRecruiters | Textkernel (documented, press release) | SmartAssistant matching |
| BambooHR | undisclosed | keyword and qualification screening on set criteria |
| Paradox | undisclosed | conversational apply and screen (documented) |
| Eightfold | in-house deep-learning matching | explanations per match, annual bias audits (documented) |

Textkernel acquired Sovren in 2021 and was acquired by Bullhorn in 2024; older advice that names Sovren means Textkernel today. Textkernel now ships an LLM-based parser alongside its classic one.

## 3. What still breaks parsing

Parsers improved, and modern ones handle simple tables and PDFs. These remain risky enough to avoid:

- **Multi-column layouts**: text is read across columns, scrambling roles and dates. Also the top layout failure in recruiter eye-tracking. (documented: Ladders 2018 study summary; parser vendor guidance)
- **Text boxes and shapes**: content is often not extracted at all.
- **Headers and footers**: several parsers skip them; contact details there can vanish. Put contact information in the body.
- **Images and icons**: ignored; text inside them is lost. Skills-as-bars and icon rows carry nothing.
- **Tables for layout**: cell order and merged cells still confuse extraction; simple two-cell contact tables usually survive, complex ones do not.
- **Non-standard section names**: "Where I've Been" is not classified as experience. Use Experience, Education, Skills, Summary.
- **Symbol fonts for bullets**: Wingdings glyphs extract as garbage characters. Use standard bullets.
- **Year-only or inconsistent dates**: tenure calculations fail or default to zero. Use Month YYYY or MM/YYYY consistently.
- **Hidden, white, or tiny text**: extracted as normal text by parsers, then flagged by screening tools and humans as stuffing. Indeed has published work on detecting resume-based prompt injection ("ignore previous instructions...") and defending its AI against it (documented: indeed.com press release, 2025). Treat any of this as disqualifying.
- **Scanned or image PDFs**: no text layer, nothing to parse. Export text-based PDFs only.

DOCX versus PDF: both parse fine in modern systems when the PDF is text-based. DOCX is the safer upload where an older Taleo or custom system is in play; PDF preserves layout for human readers. Offer both; the skill produces DOCX and can render PDF when LibreOffice is available.

## 4. Keyword matching behavior

- Parsers extract skills into taxonomies (Lightcast, ESCO, O*NET, LinkedIn Skills, vendor-specific). Normalization of plurals, tenses, and common acronyms is partial and vendor-dependent. Carry the exact JD term, and both forms of a key acronym, once each.
- Placement matters to humans more than to parsers: a skill named in a bullet with context is credible; the same skill in a wall of comma-separated terms is not. Keep the skills block to hard skills, grouped, each traceable to a bullet.
- Repetition does not raise rank in documented systems, and recruiter eye-tracking lists keyword stuffing among the reasons a resume is rejected on sight. (documented: Ladders 2018)

## 5. LLM screening and the AI-resume flood

- LinkedIn's Hiring Assistant, an agent that reviews applicants against a recruiter's criteria, became generally available in English by September 2025; LinkedIn reports recruiters reviewing far fewer profiles per hire with it. (documented: news.linkedin.com, 2025-09-03)
- Ashby, Workday, iCIMS, and Greenhouse all ship LLM summarization or per-criterion evaluation. Specific, verifiable statements survive summarization; vague ones evaporate.
- Recruiters now name AI-generated cadence as a rejection reason: uniform tone, every bullet opening with "spearheaded" or "leveraged", buzzword strings, no company-specific detail, achievements with no measurable or qualified outcome. (reported: multiple 2026 recruiter write-ups)
- Model-based screeners show demographic bias in controlled studies (name-swap experiments, 2024) and people defer to biased model recommendations most of the time (2025). This is why the skill blinds its own critique and never optimizes for a demographic signal.

## 6. US federal (USAJOBS) after 2025

- **Two-page cap, enforced.** Beginning 2025-09-27 USAJOBS restricts stored, uploaded, and builder resumes to two pages; longer resumes make the application ineligible. Applies to competitive and excepted service announcements under Title 5. (documented: OPM Applicant Guidance on the Two-Page Resume Limit; OPM Agency Guidance)
- **Fields OPM lists**: contact information; per position, job title and employer (series and grade for federal positions), start and end dates as MM/YYYY, hours per week, brief descriptions aligned to the announcement; education when relevant with completion date and GPA; optional clearance, training, languages, publications, special-program eligibility. Supervisor contact, employer address, and salary are no longer listed; they cost page budget.
- **Formatting OPM recommends**: sans-serif body at 10pt, 14pt titles, 0.5-inch margins; upload as PDF under 5 MB, no password, no PDF portfolio, plain filename.
- **Questionnaires no longer rank candidates.** Since 2025-09-30, self-assessment questionnaires may determine eligibility but not rank; structured resume reviews and validated assessments do. The resume text carries more weight than before. (documented: OPM guidance on self-reported assessments, February 2026)

## 7. Detecting the ATS from the posting

Useful for the cover note's upload advice; it does not change how the resume is written.

| Signal in the URL or posting | Likely system | Upload note |
|---|---|---|
| `*.myworkdayjobs.com`, req IDs like `R12345`, `JR-`, `WD` | Workday | DOCX or text PDF both parse; expect skill-extraction prompts on apply |
| `boards.greenhouse.io`, `job-boards.greenhouse.io` | Greenhouse | either format; knockout questions on the form |
| `jobs.lever.co` | Lever | either format; custom-question automations |
| `jobs.ashbyhq.com` | Ashby | either format; per-criterion AI review |
| `*.taleo.net`, `*.oraclecloud.com` | Oracle Taleo or Recruiting Cloud | prefer DOCX; disqualification questionnaire |
| `*.icims.com` | iCIMS | either format |
| `*.successfactors.com`, `jobs.sap.com` | SAP SuccessFactors | either format (Textkernel parser) |
| `*.smartrecruiters.com` | SmartRecruiters | either format; knockout questions auto-reject |
| `usajobs.gov` | USA Staffing | PDF under 5 MB, two pages, plain filename |

## 8. Keyword report for the cover note

Report coverage as a list, not a percentage, and keep it off the resume:

```markdown
### Requirement coverage
| JD requirement | Where on the resume | Status |
|---|---|---|
| Kubernetes | Skills; lead role bullet 2 | met |
| Workshops for engineering teams | Consulting bullet 2 | met (added after your answer) |
| TypeScript | not claimed | gap |

Upload: [DOCX or PDF per the table above]. Application form answers to keep consistent with the resume: years [n], location [x], authorization [y], clearance [z].
```

## Sources

- Greenhouse Talent Matching FAQ: https://support.greenhouse.io/hc/en-us/articles/41131886674075-Talent-Matching-FAQ
- Greenhouse, How does Greenhouse use AI: https://my.greenhouse.com/blogs/how-does-greenhouse-use-ai-heres-everything-candidates-need-to-know
- Ashby AI-Assisted Application Review: https://www.ashbyhq.com/product-updates/ai-assisted-application-review
- Eightfold NYC matching model disclosure: https://eightfold.ai/nyc-eightfold-matching-model/
- Workday HiredScore reference: https://doc.workday.com/admin-guide/en-us/workday-feature-descriptions/workday-hiredscore/hiredscore-ai-for-recruiting.html
- Workday resume parsing concept: https://doc.workday.com/admin-guide/en-us/human-capital-management/recruiting/candidates/set-up-prospects-and-candidates/hdc1552497830785.html
- Lever, Understanding Resume Parsing: https://help.lever.co/hc/en-us/articles/20087345054749-Understanding-Resume-Parsing
- Oracle Taleo prescreening: https://docs.oracle.com/en/cloud/saas/taleo-enterprise/20b/otfru/prescreening-candidates.html
- SAP SuccessFactors resume parsing (Textkernel): https://help.sap.com/docs/SAP_SUCCESSFACTORS_RECRUITING/8477193265ea4172a1dda118505ca631/07b6d03076a149b78f4f7a615e3025fd.html
- SmartRecruiters chooses Textkernel: https://www.smartrecruiters.com/news/smartrecruiters-chooses-textkernels-resume-parsing-software/
- Paradox screening: https://www.paradox.ai/products/screening
- Textkernel and Sovren: https://www.textkernel.com/sovren/
- Ladders eye-tracking update (2018): https://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html
- Indeed on resume prompt injection: https://www.indeed.com/news/releases/protecting-trust-in-hiring-ai-how-indeed-detects-and-defends-against-resume-manipulation
- LinkedIn Hiring Assistant availability: https://news.linkedin.com/2025/hiring-assistant-globally-available
- OPM two-page resume guidance (applicant): https://www.opm.gov/policy-data-oversight/hiring-information/merit-hiring-plan-resources/applicant-guidance-on-the-two-page-resume-limit/
- OPM two-page resume guidance (agency): https://www.opm.gov/policy-data-oversight/hiring-information/merit-hiring-plan-resources/agency-guidance-on-the-two-page-limit-on-resume-length/
- OPM self-reported assessments guidance: https://www.opm.gov/policy-data-oversight/hiring-information/merit-hiring-plan-resources/guidance-on-the-use-of-self-reported-assessments.pdf
- Wilson and Caliskan, LLM resume screening bias (2024): https://arxiv.org/abs/2407.20371
- Wilson et al., human deference to biased AI screening (2025): https://arxiv.org/abs/2509.04404
- HR Executive on AI rejection before human review: https://hrexecutive.com/ai-resume-screening-is-creating-a-visibility-gap-for-recruiters/
