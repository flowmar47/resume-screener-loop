# ATS Optimization

Run in **Phase 2** after draft text exists and before Phase 3 screener critique. ATS gets the resume first at most companies; the screener simulates the human who reads after.

## Detect ATS family (optional, high leverage)

Signals in priority order:

| Signal | Likely ATS |
|--------|------------|
| Req ID `R\d{4,6}`, `JR\d+`, `WD\d+` | Workday |
| URL `*.myworkdayjobs.com` | Workday |
| URL `boards.greenhouse.io` | Greenhouse |
| URL `jobs.lever.co` | Lever |
| URL `*.taleo.net` | Taleo |
| URL `*.icims.com` | iCIMS |

If unknown, **default to Workday-safe rules** (most format-sensitive).

See `industry-trends.md` for general ATS layout rules. This file focuses on **keyword pass** and **upload format**.

## Upload format guidance

| ATS family | Prefer | Notes |
|------------|--------|-------|
| Workday, Taleo | `.docx` | PDF accepted but parsed less reliably |
| Greenhouse, Lever | `.docx` or PDF | Both usually fine |
| Unknown | `.docx` | Safest default for this skill's template |

Tell the user in the cover note: **upload DOCX to the portal; use PDF for email to humans.**

## Universal format rules (already in templates)

- Single column; standard headings ("Professional Summary", "Relevant Experience", "Education", "Selected Technical Skills").
- No tables for layout; no images; no header/footer-only contact info.
- Consistent dates: `Jan 2020 – Present` style.
- Avoid em dashes and curly quotes (Taleo-sensitive); linter enforces em dashes.

## Keyword pass procedure

1. From Phase 1, list **must-have keywords** in the **exact form** the JD uses (preserve phrasing: "AWS Lambda" not "Lambda on AWS" unless equivalent is verified).
2. For each must-have, search draft (case-insensitive) for exact phrase match.
3. Mark hit / miss. For misses, **patch the closest existing bullet** to include the JD phrase naturally. Do not add orphan bullets only to stuff keywords.
4. Re-check. Most resumes converge in one patch round.
5. Cap each keyword at **~3 appearances** total across the document.

## Where to plant keywords (weighting)

Priority for parser and human skim:

1. Professional summary (top 3 JD terms)
2. Skills section (categorized, must-haves in first category)
3. **First bullet** of the lead experience role (highest-impact line)
4. Additional bullets in lead and second roles

## ATS keyword report template

Deliver to the user alongside the draft (not on the resume):

```markdown
## ATS keyword report (review only)

**Detected ATS hint:** Workday (R12345) / Greenhouse / unknown → docx recommended

### Must-have coverage
| JD phrase | Found | Location(s) |
|-----------|-------|-------------|
| Kubernetes | Yes | Skills; bullet 2 Acme Corp |
| CI/CD | No → patched | Summary; bullet 1 Acme Corp |

**Coverage:** X/Y must-haves (Z%)

### Remaining gaps (honest)
- [Requirement not addressable without fabrication]

### Patches applied
- [Bullet X: added "AWS Lambda" per JD phrasing]
```

## Word-order and synonym pitfalls

| JD | Risky resume phrasing | Prefer |
|----|----------------------|--------|
| AWS Lambda | Lambda on AWS | AWS Lambda |
| machine learning | ML only | machine learning (or both once) |
| CI/CD | CICD, CI / CD | CI/CD as JD shows |
| RESTful APIs | REST APIs | Match JD |

Some parsers normalize synonyms; many do not. **Match the JD** when the underlying work is the same.

## Priority order (when rules conflict)

1. **Defensibility** — true and interview-safe
2. **ATS parsability** — pass automated screen
3. **Recruiter scanability** — first 6–30 seconds
4. **Screener depth** — Phase 3 catches what ATS misses

Do not sacrifice (1) for (2). A keyword lie fails Phase 3 and real interviews.

## Integration with linter

After ATS patches, always run:

```bash
node scripts/build-resume.js --lint-only
```

Optional keyword check against a saved JD file:

```bash
node scripts/check-keywords.js --jd jd.txt --content content.js
```

(See `scripts/check-keywords.js` for usage.)
