# Profile Ingestion

The ledger is only as good as the sources read into it. This is the checklist for gathering and reading them. Output goes into `work/ledger.md` per `evidence-ledger.md`.

## What to ask for

If the user has not supplied enough, open with one request:

> To tailor this well I need to read your material. Share any of these:
> - Your current resume (DOCX, PDF, or pasted text)
> - LinkedIn URL (or a paste of the profile if it is private)
> - Portfolio, personal, or company site
> - Repositories or READMEs for projects you want considered
> - Certificates, transcripts, case studies, published work
> - Anything you want left off the resume, and anything you insist stays
>
> And the job: full JD, a link, or title plus company (I will look it up).

Do not proceed on thin inputs. The readers will surface the gaps as findings; better to have the material first.

## Reading each source

**Existing resume.** For DOCX, run `node scripts/docx-text.js resume.docx` to see the parser's view; it also exposes contact details hiding in a header or text in a text box. Record identity, every role (title, organization, dates, scope, bullets), projects, skills (with whether each is claimed at production level), education, credentials. Note the voice (formal, casual, marketing) and existing anti-patterns so you do not inherit them. Ask whether the candidate wants their voice preserved.

**LinkedIn and other profiles.** Fetch if permitted; otherwise ask for a paste. Cross-check titles, dates, and scope against the resume; record conflicts as questions. Capture recommendations, articles, and talks as artifact rows.

**Portfolio, personal, or company site.** Read the about, work, and methodology pages. Extract founding dates, named services or programs, stack named in public copy, differentiators, customer segments, concrete deliverables. Public copy is authoritative when it disagrees with the resume; record both and ask.

**Repositories and READMEs.** Fetch the README (raw URL if the rendered page is noisy) and linked docs. Extract real stack with versions, architecture, deployment story, shipping discipline (CI, packaging, releases), evidence of users. Code often shows senior patterns (tests, observability, error handling) the resume understates; capture them as observed rows.

**Code and document samples.** Skim for named tools and libraries, complexity, and engineering discipline. Observed rows only; do not infer skills from a single file.

**Certificates, transcripts, case studies.** Credentials that clear a hard row, coursework relevant to the matrix, described outcomes with scope.

**The conversation itself.** Preferences, constraints, and answers to questions are rows too (kind `constraint`, source `chat`, with the date).

## Building the ledger

Aim for these groups, each with several rows:

1. Identity and contact, including links the candidate allows.
2. Production work with stakes: systems where reliability had consequences (paying users, missions, regulation).
3. Customer-facing work: consulting, sales, enablement, training, with segments and audiences.
4. Engineering depth: stacks with versions, architectures, scale facts with their basis.
5. Cross-domain differentiators (legal plus AI, clinical plus data, defense plus software).
6. Education and credentials with dates.
7. Public artifacts: sites, repositories, articles, talks, products.
8. Constraints: location, remote stance, travel tolerance, clearance status, authorization.
9. Preferences: omissions, tone, roles to keep or drop, page budget.

## When to stop reading and start the matrix

You have enough when the candidate's primary discipline, strongest production work, named stack, level, education, credentials, and constraints are all in the ledger with sources. If any group is empty and the target role would care, ask before drafting.
