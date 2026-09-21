# Bullet-Writing Patterns

Use in **Phase 2** when converting working profile notes into resume bullets. Complements `workflow.md` bullet guidance and enforces `anti-patterns.md`.

## Strong bullet shapes

### Action → system → outcome

```
<Strong verb> <what you built/changed> <scope>, <honest outcome>.
```

Example: "Built multi-source price ingestion with API fallback chains for a daily subscriber briefing, maintaining strict 7:00 AM SLA across upstream outages."

### Problem → decision → result (senior IC / lead)

```
<Situation>. <Chose X over Y because Z>. <Result>.
```

Example: "Faced rotating shared secrets across 40 services; adopted JWKS public-key verification despite setup cost, eliminating quarterly rotation incidents."

### Scope → work → org impact (team-level)

```
<Ownership scope>. <What you did>. <Why it mattered>.
```

Example: "Owned auth integration for 15-service platform; delivered 2FA flow that unblocked GA launch for enterprise tier."

## Verb selection by track

| Track | Prefer |
|-------|--------|
| Engineering (build) | Built, designed, shipped, implemented, operated, debugged, instrumented |
| Engineering (lead) | Led, owned, mentored, coordinated, drove, unblocked |
| PM / TPM | Scoped, delivered, aligned, mitigated, staffed, reported |
| Customer-facing | Embedded, enabled, trained, onboarded, supported |
| Sales / CS | Expanded, retained, closed, negotiated (only with real data) |

Avoid: "responsible for", "helped with", "worked on", "involved in" unless rewriting would misstate a junior supporting role.

## First-bullet rule

The **first bullet under the lead role** is the highest-impact line on the resume. It should:

- Plant 2–3 JD must-have keywords naturally
- Reflect the strongest defensible achievement for this role
- Be interview-deep (10+ minutes of real stories)
- Pass anti-pattern and fabrication rules

## Quantification

Use numbers **only from the profile**. Acceptable without measurement theater:

- Years, team sizes, module counts, named scale facts the candidate can explain
- Qualitative: "paying subscribers", "daily automated execution", "multi-year retention"

If no number exists: ask in discovery, use qualitative phrasing, or omit the claim.

## Bullets to avoid

| Weak | Fix direction |
|------|----------------|
| Responsible for backend services | Name stack, scale, ownership |
| Improved performance | Method + honest scope (no fake %) |
| Worked on Kubernetes migration | Role + outcome + scale |
| Long comma-separated tech list in Experience | Move to Skills; Experience = actions |

## Length

- 1–2 lines rendered per bullet for most roles
- 3 lines max for a flagship achievement on the lead role
- Vary opening verbs across adjacent bullets

## JD vocabulary without lying

If JD says "platform engineering" and profile says "infrastructure platform", use **platform engineering** in the resume when the work is the same. Semantic alignment for ATS and recruiters is fine; inventing work is not.

## Self-referential framing

Do not write: "Demonstrates the same pattern [Target Company] uses." Describe the work; let the reader infer fit.
