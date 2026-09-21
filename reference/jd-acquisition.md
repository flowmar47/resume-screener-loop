# JD Acquisition and Decomposition

Skip the acquisition half when the user pastes the full JD. The decomposition half always applies; it feeds the requirements matrix.

## Acquiring the JD

**Pasted text**: read it. Save it to `work/jd.txt` for the checker.

**URL**: fetch it with your web tool or `curl`. Greenhouse (`*.greenhouse.io`), Lever (`jobs.lever.co`), Ashby (`jobs.ashbyhq.com`), and most company career pages return the full text. Workday (`*.myworkdayjobs.com`) often renders the body with JavaScript; if you get navigation chrome and no requirements, try the company's own careers page or ask the user to paste. LinkedIn, Indeed, and Glassdoor copies are often stale or truncated; prefer the employer's listing.

**Title plus company**: search for `"{Company}" "{Title}" careers`, then the ATS hosts (`site:greenhouse.io`, `site:lever.co`, `site:ashbyhq.com`, `site:myworkdayjobs.com`). Choose the employer's own listing. Confirm title and company match what the user named.

**Title only**: ask which company. Never generate a JD or borrow a similar one; the matrix would be fiction.

**Verify before decomposing**: the posting is open, the company is right (aggregators mislabel), the location or remote stance matches what the user wants, and the comp band (if posted) is one they would accept or have acknowledged.

## Decomposing the JD into matrix rows

Read the whole posting, including the "about the team" paragraph and any "you'll thrive if" section; the real bar often hides there. Then extract:

**Hard filters** (type `hard`, weight 3): "required", "must", "minimum" lines; years of experience; degree or licensure; clearance or citizenship; work authorization; a named language, platform, or certification in the required list; location or on-site requirement; travel percentage.

**Knockout questions the form will ask** (also `hard`) even when the JD is silent: authorization to work, willingness to relocate or be on site, years in the field, salary expectations within the band, required credential held today.

**Soft preferences** (type `soft`, weight 2 when the JD spends a sentence, 1 when listed): "preferred", "nice to have", "bonus", "ideally".

**Responsibilities** (type `responsibility`): what the role does day to day. These shape verbs and framing, and they often reveal the true level (owning a service versus contributing to one).

**Culture signals** (type `culture`): repeated themes ("mission", "ownership", "customer obsession", "move fast", "cross-functional"). They tune the summary's tone within the banned-vocabulary rules.

**Level and band**: years range (3+ entry, 5+ mid, 8+ senior, 10+ staff, 15+ principal, with "senior" inflated at many companies so an 8+ "senior" is staff-coded); title decoration; scope language; posted compensation. The resume's scope language must match.

**Company archetype**: pick Reader B's persona now (`screener-personas.md`) and note it in the matrix header.

## Patterns by company type

- **Frontier AI lab**: "About the team" names the research direction; "You'll thrive if" is the real bar; comp posted. Screen-killers hide in "thrive if".
- **Defense and aerospace**: Basic Qualifications are hard filters, Preferred are soft; clearance and travel lines are non-negotiable and belong on the resume.
- **Enterprise SaaS**: "What you'll do" and "What you'll bring"; industries served are often named and should be echoed where the ledger supports it.
- **Startup**: often no qualifications list; infer the bar from responsibilities and team description, and say in the matrix that it was inferred.
- **US federal (USAJOBS)**: "Specialized experience" paragraphs are the hard rows; each must be addressed in the candidate's own words within two pages; the announcement's grade and series define the level.

## Output

`work/jd.txt` (the text as fetched, for the checker) and the rows of `work/matrix.md` with evidence columns still empty. Fill evidence and status in Phase 2.
