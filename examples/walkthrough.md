# Walkthrough: One Full Loop

A worked example on a fictional candidate. Every name, company, and URL here is invented; the checker output is real, produced from the sample built with the repository's templates.

## Setup

**Candidate**: Avery Lin, pivoting from solar project management to AI deployment. Supplies an existing two-page resume from the solar role, a personal site (`averylin.example`) documenting a subscription market-briefing product with paying subscribers since 2023, the product's repository README (Python 3.11, FastAPI, multi-source ingestion, Prometheus and Grafana, Docker on Ubuntu Server), and a LinkedIn URL. Preferences: keep the site link, no salary figures.

**Job**: "AI Deployment Engineer at OpenAI", no URL. Searched, fetched the employer's listing, saved to `work/jd.txt`.

## Phase 1: Evidence ledger (excerpt)

| id | fact | source | kind | confidence | basis |
|---|---|---|---|---|---|
| E1 | Senior Project Manager, Acme Solar, Jun 2017 to Feb 2025 | resume, LinkedIn | role | stated | |
| E2 | Founder, Daily Financial Alerts, Jan 2023 to present | site About, LinkedIn | role | stated | |
| E3 | Briefing delivered to paying subscribers every trading day by 7:00 AM Pacific | site methodology page | scope | observed | |
| E4 | Ingestion from Alpha Vantage, FRED, Polygon, Finnhub with fallback chains and cross-source price validation | README, Architecture | project | observed | |
| E5 | Briefing has nine sections; alerting on missed sections | README, Operations | scope | observed | |
| E6 | Evaluation harness for tool-call accuracy and section completeness | README, Testing | project | observed | |
| E7 | Prometheus and Grafana dashboards; runbooks per upstream failure | README, Operations | project | observed | |
| E8 | "Cut briefing build time by 60%" | old resume | metric | stated | unmeasured: no baseline recorded |
| E9 | Consulting for two enterprise clients (fintech, healthcare) on LLM workflow automation since Mar 2025 | LinkedIn, chat | role | stated | |
| E11 | Daily use of Claude Code and Cursor; reference implementations left with clients | chat | skill | stated | |
| E12 | Cross-functional teams of 12 (engineering, construction, interconnection, permitting) | old resume | scope | stated | |
| E13 | Multi-year commercial solar portfolio, on-time delivery | old resume | scope | stated | |
| E15 | B.S. Electrical Engineering, UT Austin, 2017 | resume | education | stated | |
| E16 | Austin, TX; open to remote US; no sponsorship needed | chat | constraint | stated | |

Questions raised: Q1 "Have you run any training or enablement sessions, internal or external? Audience, topic, when." Q2 "The 60% build-time figure: measured how, against what baseline?"

## Phase 2: Requirements matrix and fit tier

| id | requirement | type | weight | evidence | status | placement |
|---|---|---|---|---|---|---|
| R1 | 5+ years technical consulting, post-sales, or solutions architecture | hard | 3 | E1, E9 (PM plus consulting) | adjacent | summary (bridge: technical program delivery for enterprise stakeholders) |
| R2 | Power user of AI coding tools, customized workflow | hard | 3 | E11 | met | summary, skills |
| R3 | Delivered large workshops or technical training to engineering teams | hard | 3 | none | ask (Q1) | pending |
| R4 | Contributed technical guides or examples publicly | hard | 3 | E3 methodology pages, repo README | partial | public work section |
| R5 | Own customer outcomes from discovery through rollout | responsibility | 2 | E9 | met | consulting bullets |
| R6 | Comfortable with Python and TypeScript | hard | 2 | E4 (Python); no TypeScript row | partial | skills; fit note |
| R7 | Evaluation harnesses for LLM applications | soft | 2 | E6 | met | lead role bullet 3 |
| R8 | Fintech or healthcare customer experience | soft | 1 | E9 | met | consulting header |
| R9 | Remote US, work authorization | hard | 3 | E16 | met | contact line, summary |

Tier before answers: **weak** (R3 is `ask`, counted as a gap). Reported to Avery with Q1 and Q2.

Avery's answers: Q1, three half-day enablement sessions for the two consulting clients on prompt design and evaluation harness construction (new row E10). Q2, never measured; drop the number. R3 becomes `met`. Recomputed tier: **moderate**. All hard rows met or adjacent with one adjacent (R1) carrying a stated bridge; R6 partial on TypeScript is noted in the fit note.

## Phase 3: Draft

Composition, in matrix order: name and contact with the remote statement (R9); headline "AI Deployment Engineer"; summary carrying the R1 bridge, R2, and R9; lead role Daily Financial Alerts (E2 to E7); consulting role with the workshop bullet (E10) and the tooling bullet (E11); solar PM compressed to two bullets (E12, E13); skills in four categories; Selected Public Work (R4); education (E15). No number from E8.

Built with the templates:

```bash
node build_avery.js
# Wrote: ./Resume_Avery_Lin_OpenAI_AI_Deployment_Engineer.docx
```

## Phase 4: Mechanical gate

```bash
node scripts/resume-check.js Resume_Avery_Lin_OpenAI_AI_Deployment_Engineer.docx \
  --jd jd_openai.txt --must "Python,workshops,Claude Code" --text Resume_Avery_Lin.txt
```

Output:

```
resume-check: Resume_Avery_Lin_OpenAI_AI_Deployment_Engineer.docx  [docx]  pages: 1 (estimate)  words: 401

MINOR    [acronym-both-forms] keyword appears in only one form; parsers do not always map acronym to expansion.
           - LLM: also spell out "large language model" once
VERIFY   [jd-terms-missing] JD terms not found in the resume, highest weight first. Judge each: genuine gap (say so in the fit assessment), same skill under another name (use the JD's wording once), or irrelevant (ignore). Never add a term the candidate cannot defend.
           - user of ai (w3)
           - contributed technical guides (w3)
           - technical consulting (w3)
           - post-sales engineering (w3)
           - solutions architecture (w3)
           - power user (w3)
           - high-impact workshops (w3)
           - technical training (w3)
           - customer outcomes (w3)
           - healthcare customer (w3)
           - examples (w3)
           - clarity (w3)
           - pedagogy (w3)
           - community (w3)
           - typescript (w3)
INFO     [page-budget] 1 page(s) (estimate; install LibreOffice for an exact count), budget 2.
INFO     [word-count] 401 words.
INFO     [keyword-coverage] diagnostic only, not an ATS score: 10 of 25 candidate JD terms appear in the resume.
INFO     [must-have-present] all 3 required term(s) present.

top-third preview (what a 7-second scan sees):
  | AVERY LIN
  | Austin, TX (open to remote US)  |  avery@averylin.example  |  (555) 555-0100
  | linkedin.com/in/averylin  |  averylin.example
  | AI Deployment Engineer
  | PROFESSIONAL SUMMARY
  | Eight years delivering technical programs for enterprise stakeholders, the last three building and operating a produc...
  | RELEVANT EXPERIENCE
  | Founder & Principal Engineer  |  Daily Financial Alerts (averylin.example)	Jan 2023 – Present
  | Production agentic AI platform with paying subscribers and a daily delivery SLA.
  | • Built and operate a production agentic platform that compiles a nine-section market briefing for paying subscribers...

summary: 0 blocker, 0 major, 1 minor, 1 verify, 4 info → PASS
```

Working the VERIFY list against the matrix: "power user" and "customer outcomes" are wording mismatches (the ledger supports both; use the JD's phrasing once). "technical consulting", "post-sales engineering", "solutions architecture" are the R1 bridge; the summary will name "technical consulting" explicitly. "typescript" is the R6 gap; it stays in the fit note. "pedagogy", "community", "clarity", "examples" are culture language, ignored. The LLM acronym note is accepted: spell it out once in the skills line.

## Phase 5: Three-reader screen (blinded copy)

**Reader A, recruiter scan.** From the top third: title line matches the req, current role is a founder-engineer role with dates, remote US and authorization answered, skills block leads with the AI coding tools the JD names. Knockouts answerable. Verdict: **forward**. One finding (clarity, major): total years of relevant experience are not obvious at a glance; "eight years" in the summary reads as PM years. Fix: state "three years operating a production AI system, eight years delivering technical programs" in that order.

**Reader B, hiring manager (frontier AI lab persona), run 1.**

> Hiring manager: leads the Codex deployment team. Bar: has shipped AI into a customer's engineering workflow, teaches well, writes publicly, power user. Verdict at 30 seconds: forward, flagged on public writing.
>
> What works: the alerts platform is real production AI with a daily SLA and paying users; the fallback and validation detail reads like someone who has been paged. The workshop bullet answers the training requirement with audience and topic.
>
> What is wrong: (fit, major) public contribution is a personal site and a repo, not guides or examples other engineers have used; say what the methodology pages teach and whether anyone outside uses the repo. (credibility, minor) "Embedded with two enterprise engineering teams" needs the segment named in the bullet, not only the header. (clarity, minor) the solar note line "Multi-million-dollar program execution" is scale language for a different reader; cut it.
>
> What would change my mind: one Cookbook-style guide published before applying.
>
> Verdict: forward, flagged on public technical content.

**Run 2** reproduced the public-content finding and the segment finding; the note-line finding did not recur and is dropped.

**Reader C, skeptic.** Challenged: "nine-section briefing" (E5, holds); "cross-source price validation" (E4, holds); "three half-day sessions" (E10, candidate-stated; interview probe: "walk me through one session's agenda"); "eight years delivering technical programs" (E1 spans seven years eight months; rewrite as "since 2017"). No numbers without basis remain. Titles and dates match LinkedIn.

## Phase 6: Revision and convergence

Round 1 changes: reorder the summary's experience clause; "since 2017" instead of "eight years"; name fintech and healthcare in the consulting bullet; expand the public-work bullets to say what each page teaches and that the repo's runbooks are referenced by the two client teams (E9, confirmed with Avery); spell out "large language model" once; cut the solar note line. Rebuilt, gate passed with the same profile, Reader A forward, Reader B forward-flagged on a flag only Avery can change (a published guide), Reader C no open challenges. Converged after one round.

## Phase 7: Deliverable

```
out/Resume_Avery_Lin_OpenAI_AI_Deployment_Engineer.docx
out/Resume_Avery_Lin_OpenAI_AI_Deployment_Engineer.txt
```

Cover note:

> Fit: moderate. Hard requirements met or bridged; the consulting-years requirement is answered by technical program delivery plus eighteen months of AI deployment consulting, stated as such. Gaps: TypeScript (not claimed), and public technical content is thinner than the JD wants; a single published guide before applying would move the hiring-manager verdict from forward-flagged to forward. One round of revision. Nothing on the page relies on an unmeasured number; the old 60% figure was dropped at your confirmation.
>
> Interview probes: the workshop agenda (E10); how cross-source price validation decides which provider to trust (E4); what "unattended" means operationally and what pages you (E5, E7).
>
> Open: none. You review and submit; I have not sent anything anywhere.

## What the example shows

- The ledger turned an unmeasured percentage into a question and then into its removal, instead of into a bullet.
- The matrix made the fit tier a computation: `ask` counted as a gap until answered, and the answer moved the tier.
- The gate ran before any critique and produced the plain-text file for free.
- Reader A caught a top-third problem no bullet-level critique would; Reader B's repeat run dropped a taste finding; Reader C produced the interview probes.
- The loop converged in one round because the checker had already removed the mechanical noise the critics would otherwise have spent their findings on.
