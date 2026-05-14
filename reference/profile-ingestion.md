# Profile Ingestion

The skill's outputs are only as good as its inputs. This file is the checklist for gathering and processing profile material.

## What to ask the user for

Open with a short ingestion prompt if the user hasn't provided everything. Example:

> To tailor this well I need to read your profile. Please share any of these you have:
> - An existing resume (DOCX, PDF, or pasted text)
> - Your portfolio, personal site, or business site URL
> - GitHub repos for projects you want to highlight (or other code hosting)
> - LinkedIn URL (or Indeed / job-app profile)
> - Any supporting docs: certifications, transcripts, case studies, README files
>
> Then share the job spec: full JD, JD URL, or just title + company (I'll search).

Don't proceed on thin inputs. The screener-pass will surface the gaps as resume weaknesses; better to gather the material up front.

## Reading each input type

### Existing resume

Read it cover to cover. Note these things in working memory:

- Identity: name, location, contact info, links.
- Each role: title, organization, dates, scope statements, bullets. Note any anti-patterns (em dashes, fabricated metrics, marketing tone).
- Each project: name, stack, scope, outcome.
- Each skill: tool, framework, language. Note which are claimed at production level vs aspirational.
- Education: degrees, schools, dates, relevant coursework.
- Credentials: certifications, licenses.

Note the existing voice too. Some users want their existing voice preserved; others want it rewritten. If unclear, ask.

### Portfolio / business site

`web_fetch` it. Read in full. Extract:

- Founding date and operational timeline.
- Brand framing (named services, named programs, named methodologies).
- Technical stack mentioned in public copy.
- Differentiators ("only firm in X", "first to do Y").
- Customer / industry segments named.
- Specific deliverables described.

Cross-reference with the existing resume. Sometimes the public site has facts the resume omits (founding date corrections, integrated brand framing, specific program names). Always update from authoritative public sources.

### GitHub or code-hosting repos

If the user names a repo, fetch the README. If the README links to other docs (CONTRIBUTING.md, docs/, etc.), consider fetching them.

Extract:

- Languages and frameworks used (with versions).
- Architecture (frontend, backend, infra, deployment).
- Shipping discipline (CI, packaging, distribution).
- Real users / paying users / production deployment evidence.
- Open-source contribution patterns.

Code samples sometimes reveal senior-level patterns (proper testing, observability, error handling) that the candidate's resume understates. Surface these.

### LinkedIn / Indeed / job-app profile pages

`web_fetch` the URL. Cross-check:

- Title alignment with the resume.
- Date alignment with the resume.
- Scope statements that contradict the resume.
- Any endorsements, recommendations, or articles that signal external validation.

If LinkedIn says something the resume doesn't (e.g., a team size, a customer name), consider whether to add it to the resume.

### Supporting documents

Certifications, transcripts, project descriptions, case studies. Read for:

- Credentials that strengthen weak quals (transcripts can substitute for engineering degree in some cases).
- Specific named projects with described outcomes.
- Coursework that matters for technical / quantitative roles.

## Synthesizing the working profile

After ingestion, write a working profile in scratch (not on the resume) with these sections:

1. **Identity:** name, location, contact, links.
2. **Production work with stakes:** systems where reliability has consequences (paying users, mission-critical, regulated).
3. **Customer-facing work:** consulting, sales, training, enablement.
4. **Engineering depth:** named stacks with versions, named architectures.
5. **Cross-domain differentiators:** legal + AI, healthcare + AI, defense + AI, etc.
6. **Education and credentials:** degrees, certifications, coursework.
7. **Public-facing artifacts:** sites, repos, articles, talks.
8. **Constraints:** location, travel willingness, clearance status, remote / hybrid / on-site preference.
9. **User-stated preferences:** no GitHub, no specific dollar amounts, no em dashes (always), etc.

This working profile is the source of truth for everything written into the resume.

## When to stop ingesting and start writing

You have enough to start when:

- The candidate's primary discipline is clear.
- The candidate's strongest production work is documented.
- The candidate's named stack is clear.
- The candidate's level (IC, senior, staff, principal) is clear.
- Education and credentials are known.
- Constraints (location, clearance, travel) are known.

If any of these are missing, ask before writing.
