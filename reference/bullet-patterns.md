# Bullet Patterns

How to turn ledger rows into bullets. Each bullet cites its rows in the working copy; the skeptic checks them.

## Shapes

**Outcome, mechanism, tools** (the default; Google's "accomplished X as measured by Y by doing Z" when a measured Y exists):

> Reconciles processor files against ledger entries nightly, unattended, with alerting on drift; Go, PostgreSQL, Kafka.

**Scope, work, why it mattered** (ownership bullets):

> Owned authentication for a fifteen-service platform; shipped the two-factor flow that unblocked the enterprise tier's launch.

**Situation, decision, result** (senior and staff roles, one per lead role at most):

> Rotating shared secrets across forty services caused quarterly incidents; moved verification to published keys despite the setup cost, and the rotation incidents stopped.

**Qualified outcome when there is no measurement**:

> Replaced a manual deploy runbook with one pipeline (GitHub Actions, Terraform) for six services; deploys no longer wait on an operator.

## Verbs by track

| Track | Prefer |
|---|---|
| Engineering, build | built, designed, shipped, implemented, operated, debugged, instrumented, migrated, reconciled |
| Engineering, lead | led, owned, mentored, coordinated, unblocked, reviewed |
| Program and product | scoped, delivered, negotiated, aligned, staffed, reported, prioritized |
| Customer-facing | embedded, enabled, trained, onboarded, supported, ran (workshops) |
| Sales and success | closed, expanded, retained, renewed (with attainment from the ledger) |
| Research | measured, evaluated, published, replicated, modeled |

Never as openers: spearheaded, leveraged, orchestrated, utilized, championed, pioneered, fostered, streamlined, drove, helped, worked on, responsible for. No opener more than twice in the document; none twice in a row under one role.

## The first bullet under the lead role

It is the most-read line after the header. It carries the strongest hard-row match, the candidate's strongest defensible scope, and two or three of the JD's exact terms where the ledger supports them. It should be able to sustain ten minutes of interview questions.

## Length and count

One to two rendered lines per bullet (the checker flags anything past about 240 characters). Up to six bullets on the lead role, two to four on older roles, one or two on roles kept only for timeline continuity.

## Numbers

Only from the ledger, only with a basis. Team sizes, counts of things the candidate can enumerate, cadence, and named system facts usually have one. Percentages and dollar figures usually do not; when they do not, qualify: scope, before and after state, audience, cadence.

## JD vocabulary without lying

When the posting says "platform engineering" and the ledger says "infrastructure platform" for the same work, use the posting's term. When the work differs, do not. Carry a searched acronym and its expansion once each.

## Weak bullets and their fixes

| Weak | Fix |
|---|---|
| Responsible for backend services | name the services, the stack, and what owning them meant |
| Improved performance | the mechanism and the honest scope; no invented percentage |
| Worked on the Kubernetes migration | your role, what moved, what changed afterwards |
| A comma-separated tool list inside Experience | move tools to Skills; Experience is actions and outcomes |
| A bullet that would read the same at any company | add the thing only this candidate at this company could say |

## Self-referential framing

Do not write "demonstrates the same pattern {target company} uses." Describe the work.
