# JD Acquisition

If the user provides a full JD, this file isn't needed. If they provide a URL or a title + company only, follow these patterns.

## Input forms

### Form 1: Full JD as pasted text

Read it. No fetching needed. Skip to extraction.

### Form 2: JD URL

`web_fetch` the URL. Some patterns:

- Greenhouse (`*.greenhouse.io`), Lever (`jobs.lever.co`), Workday (`*.myworkdayjobs.com`), and direct company career pages all work with `web_fetch`.
- Indeed / LinkedIn / Glassdoor sometimes block direct fetch; if a fetch fails, try the underlying company career page instead.
- For Workday-style JDs, the actual JD text is sometimes loaded via JavaScript. If the fetch returns only navigation chrome with no JD body, try the company's direct career site listing.

After fetching, confirm the listing is current. Reject any JD that's been deleted, filled, or otherwise unreachable; ask the user for an alternative.

### Form 3: Title plus company

Use `web_search` first:
- `"{Company} careers" "{Role title}"`, most specific
- `"{Company}" "{Role title}" site:greenhouse.io`, for greenhouse-hosted boards
- `"{Company}" "{Role title}" remote`, when remote is implied

From the search results, identify the company's official career page or trusted ATS listing (Greenhouse, Lever, Workday). Avoid third-party listings (Indeed scrapes, LinkedIn screenshots, Glassdoor copies); they're often stale.

Fetch the chosen listing. Confirm it matches the title + company the user named.

### Form 4: Title only, no company

Ask the user which company. If they don't have a specific company in mind, ask whether they want help researching similar roles at a list of companies. Don't generate a JD from scratch; tailoring requires a real JD.

## JD extraction

Once the JD text is in hand, extract:

### Hard filters (Required Qualifications)

These are the lines that read as "you must have X". Common patterns:

- "Minimum X years of Y experience"
- "Bachelor's / Master's / PhD in Z field"
- "Active or eligible for Q clearance"
- "Authorized to work in the US without sponsorship"
- "Proficient in {specific language / framework}"

If the candidate doesn't clear a hard filter, name it explicitly in the fit assessment. Some hard filters can be substituted (equivalent practical experience for a degree); some can't (active TS clearance, US citizenship).

### Soft filters (Preferred Qualifications)

These are "would like to have X". Each one met raises the candidate's rank.

### Responsibilities

What the role actually does day-to-day. The resume's bullets should mirror this section's verbs and scope.

### Level signal

Look for:
- Years-of-experience range (3+ entry, 5+ mid, 8+ senior, 10+ staff, 15+ principal).
- Title decoration (Senior, Staff, Principal, Distinguished, Manager, Director, VP).
- Scope language (own a project, lead a team, run an org).

Match the resume's scope language to this signal.

### Compensation

If posted, note the range. Use it to calibrate the resume's gravitas.

### Location, travel, clearance

Non-negotiable. Pull these into the resume's summary or a dedicated section.

### Cultural signals

Repeated themes in the JD text:
- "Mission-driven" / "high-impact" / "high-ownership" → high-ownership startup or mission-driven company.
- "World-class" / "best-in-class" → BigCo or sales-heavy company.
- "Move fast" / "ship fast" → startup pace.
- "Cross-functional collaboration" → matrix org.
- "Customer obsession" → Amazon-style or SaaS company.

Calibrate the summary tone to the JD's signal.

## Common JD patterns by company type

### Frontier AI lab JD

Common structure:
- "About the team" paragraph naming research direction.
- "About the role" with bullet list of responsibilities.
- "You'll thrive in this role if you" section that's the real bar.
- Compensation range.

The "thrive if" section often contains the screen-killers. Read it carefully.

### Defense / aerospace JD

Common structure:
- Company / division summary.
- Position responsibilities (often 5-10 bullets).
- "Basic Qualifications", hard filters.
- "Preferred Qualifications", soft filters.
- Clearance requirement.
- Travel percentage.

Both Basic and Preferred qual sections matter. The clearance and travel lines are non-negotiable inputs.

### Enterprise SaaS JD

Common structure:
- About the team.
- About the role.
- "What you'll do" bullets.
- "What you'll bring" qualifications.
- Sometimes: "Nice to have" / "Bonus points".

Often includes named customer industries served. Look for these as cues for industry segments to name in the resume.

### Startup JD

Often less structured. May skip the qualifications list entirely. The screener-pass needs to infer the bar from the responsibilities and the team description.

## Verification

Before tailoring, confirm:

- The JD is current (not filled / closed).
- The company is correctly identified (some JDs scrape from third-party boards with mislabeled companies).
- The location matches what the user wants (remote / on-site / hybrid).
- The compensation range matches what the user is willing to accept (or the user has accepted the gap).

If anything is off, ask before tailoring.
