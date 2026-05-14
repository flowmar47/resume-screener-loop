# Walkthrough: A Full Loop, End to End

A worked example of the four-phase workflow on a single role. The candidate and company are fictional; only the methodology is real.

## The setup

**Candidate input:** Avery Lin, a senior engineer pivoting from solar PM to AI deployment. Provides:
- An existing resume from their solar PM role (DOCX, 2 pages).
- A personal site `averylin.example` documenting a side project: a production agentic AI system for personal financial alerts with paying subscribers since 2023.
- A GitHub repo for the financial-alerts system (Python, FastAPI, multi-source API ingestion).
- LinkedIn URL.

**Job input:** "AI Deployment Engineer at OpenAI", no JD URL provided.

## Phase 1: Profile and JD ingestion

### Acquiring the JD

The candidate gave a title and company only. Search:

```
web_search: "OpenAI" "AI Deployment Engineer" careers
```

Top result: `openai.com/careers/ai-deployment-engineer-codex/`. Fetch:

```
web_fetch: https://openai.com/careers/ai-deployment-engineer-codex/
```

Read the JD in full. Extract:

- **Required quals:** 5+ years technical consulting / post-sales / SA, power user of AI coding tools, large-format workshops, contributed technical content publicly.
- **Responsibilities:** Embed with customer engineering teams; design AI-enhanced workflows; build demos with Codex itself; lead workshops; contribute to OpenAI Cookbook.
- **Level:** Senior IC.
- **Comp range:** $197K – $278K + equity.
- **Location:** Remote US.
- **Cultural signals:** "Power user", "deeply customized developer workflow", "high-impact workshops".

### Ingesting the candidate's profile

1. **Resume.** Read it. Note: Avery has 8 years of solar PM experience but limited customer-facing AI work in the existing resume.
2. **Personal site.** `web_fetch` `averylin.example`. Site documents the financial-alerts product: operational since 2023, paying subscribers, daily SLA at 7:00 AM PST, multi-source API integration.
3. **GitHub README.** Real production system: Python 3.11, FastAPI, multi-API ingestion (Alpha Vantage, FRED, Polygon, Finnhub), Prometheus / Grafana monitoring, Docker, deployed on Ubuntu Server with systemd.
4. **LinkedIn.** Confirms titles and dates. Adds: Avery has done occasional consulting for two enterprise clients on AI deployment over the past 18 months.

### Fit assessment

- 5+ years technical: yes (8 years of PM + 18 months consulting + 3 years on the AI product).
- Power user of AI coding tools: implied but not on the existing resume.
- Workshops: minimal evidence; some internal training at solar PM role.
- Public technical content: the personal site is public, but no Cookbook contributions.

**Fit: Moderate-strong.** Strong on production AI credibility and customer-facing background; weak on public technical writing.

State the fit assessment to Avery before drafting:

> Your fit on this role is moderate-strong. You meet the 5+ years required experience cleanly via PM and consulting, your financial-alerts product is exactly the kind of production AI credibility this role needs, and your customer-facing background lands. The weakest signal is public technical writing; no OpenAI Cookbook contributions or open-source AI work is on the resume currently. I'll draft accordingly. If you have any technical writing I missed, send it now.

## Phase 2: Tailored draft

Set up the working directory:

```bash
mkdir avery_lin_openai && cd avery_lin_openai
cp /path/to/skill/templates/lib.js .
cp /path/to/skill/templates/content-template.js ./content.js
```

Fill `content.js` with Avery's actual material:

```js
const CONTACT_LINE_1 = [
  "Austin, TX  |  ",
  "avery@averylin.example",
  "  |  (555) 555-5555",
];
const CONTACT_LINE_2 = [
  { link: "https://linkedin.com/in/averylin", text: "linkedin.com/in/averylin" },
  "  |  ",
  { link: "https://averylin.example", text: "averylin.example" },
];

const ALERTS_HEADER = {
  title: "Founder & Principal Engineer",
  org: "Daily Financial Alerts (averylin.example)",
  dates: "2023 – Present",
};
const ALERTS_BULLETS_AI = [
  bullet("Architected and operate a production agentic AI platform delivering a daily institutional-grade briefing to paying subscribers via Telegram and Signal at 7:00 AM PST every trading day; durable enough to run unattended day after day."),
  bullet("Multi-stage agentic workflow orchestrating many coordinated tool calls per run across multiple financial-data APIs with intelligent fallback chains, multi-source price validation, and graceful degradation when individual providers fail."),
  bullet("Designed evaluation harnesses for tool-calling accuracy, data completeness, and end-to-end workflow success; built monitoring (Prometheus, Grafana) and runbooks that preserve subscriber SLA through upstream failures."),
  // ...
];

const SOLAR_PM_HEADER = {
  title: "Senior Project Manager",
  org: "Acme Solar",
  dates: "2017 – Present",
};
const SOLAR_PM_BULLETS_SHORT = [
  bullet("Direct cross-functional teams of 12+ across engineering, construction, utility interconnection, and AHJ permitting; consistent on-time delivery across multi-million-dollar commercial programs."),
  bullet("Translate ambiguous requirements into scoped plans; present status, risk, and trade-offs to executive stakeholders."),
];

// ... etc
```

Build `build_codex_de.js`:

```js
const { name, contact, sectionHeader, summary, buildDoc, writeDoc,
        roleHeader, roleNote, bullet, skillLine } = require("./lib");
const C = require("./content");

function build() {
  const c = [];
  c.push(name("AVERY LIN"));
  c.push(contact(C.CONTACT_LINE_1));
  c.push(contact(C.CONTACT_LINE_2));

  c.push(sectionHeader("Professional Summary"));
  c.push(summary(
    "Five plus years of customer-facing technical advisory across enterprise AI deployment, " +
    "consulting, and regulated infrastructure delivery. Daily power user of modern AI coding " +
    "tools with a deeply customized developer workflow. Operate a production agentic AI platform " +
    "with a strict daily SLA for paying subscribers; embed with customer engineering teams from " +
    "discovery through production rollout."
  ));

  c.push(sectionHeader("Relevant Experience"));

  // Lead with the most-relevant role: the AI product
  c.push(roleHeader(C.ALERTS_HEADER));
  c.push(roleNote("Production agentic AI platform delivering a strict daily SLA to paying subscribers."));
  c.push(...C.ALERTS_BULLETS_AI);

  // Customer-facing consulting
  c.push(roleHeader(C.CONSULTING_HEADER));
  c.push(...C.CONSULTING_BULLETS);

  // Solar PM as supporting cross-functional credibility
  c.push(roleHeader(C.SOLAR_PM_HEADER));
  c.push(roleNote("Multi-million-dollar program execution across regulated multi-stakeholder environments."));
  c.push(...C.SOLAR_PM_BULLETS_SHORT);

  c.push(sectionHeader("Selected Technical Skills"));
  c.push(skillLine("AI Coding Tools (Daily)", "Claude Code, Cursor, Windsurf, Cline, v0"));
  c.push(skillLine("LLM & Agentic Systems", "Claude API, GPT-4, self-hosted Ollama, RAG, multi-model evaluation"));
  c.push(skillLine("Engineering Stack", "Python (FastAPI, asyncio), Docker, Ubuntu Server, Prometheus, Grafana"));
  c.push(skillLine("Customer-Facing Delivery", "Technical discovery, workshops, runbook authoring, post-rollout support"));

  c.push(sectionHeader("Selected Public Work"));
  c.push(bullet("averylin.example, methodology pages document the agentic system architecture, multi-API orchestration patterns, and evaluation harness design."));

  c.push(sectionHeader("Education"));
  c.push(...C.EDU);

  return c;
}

(async () => {
  const doc = buildDoc(build());
  await writeDoc(doc, "/output/Resume_Avery_Lin_OpenAI_Codex_DE.docx");
})();
```

Build, then verify page count:

```bash
NODE_PATH=$(npm root -g) node build_codex_de.js
libreoffice --headless --convert-to pdf Resume_Avery_Lin_OpenAI_Codex_DE.docx
pdfinfo Resume_Avery_Lin_OpenAI_Codex_DE.pdf | grep Pages
# Pages: 2
```

Run the anti-pattern checklist:

- No em dashes: confirmed.
- No fabricated metrics: "many coordinated tool calls", "multiple financial-data APIs", "paying subscribers", "daily SLA", all qualitative or structurally true.
- No "world-class", "passionate about", etc.: confirmed.
- No overclaimed expertise: Avery has the FastAPI / agentic / customer-facing claims documented.

Draft is ready for screening.

## Phase 3: In-character screener critique

> **Hiring agent: OpenAI Codex DE Recruiter, screening for the Codex Deployment Engineer role.**
>
> **Bar:** 5+ yrs technical consulting / post-sales / SA, power user of AI coding tools, large-format workshops, contributed technical content publicly, end-to-end customer ownership.
>
> **Verdict at 30 seconds: Forward, with reservations.**
>
> **What works:**
> - The "deeply customized developer workflow" framing matches the JD verbatim. Lands well.
> - Production AI credibility is real: paying subscribers, daily SLA, multi-source ingestion. Strong substrate.
> - 5+ years requirement met cleanly with the PM + consulting + AI product mix.
>
> **What's wrong:**
> 1. **No large-format workshops documented.** The JD explicitly says "Have experience delivering large, high-impact workshops or technical training to engineering teams." The resume mentions "post-rollout support" but doesn't name a single workshop. If Avery has done any workshops, they need to be named.
> 2. **No public technical content beyond the personal site.** The JD says "Have contributed technical guides, patterns, or examples publicly and care about clarity, pedagogy, and community impact." No Cookbook contributions, no blog posts, no conference talks. The "Selected Public Work" section is one bullet; it should be more.
> 3. **No customer logos or industry segments.** "Customer engineering teams" is vague. The two enterprise consulting clients Avery has worked with: even if they can't be named publicly, the industries served should be.
> 4. **No Codex-specific framing.** This is the Codex DE role; the resume could mention SDLC integration patterns, code-generation workflows, or agent-in-IDE patterns specifically.
> 5. **Solar PM is taking real estate but doing little for this role.** Compress to two short bullets at most.
>
> **What would change my mind:**
> - Add explicit workshop bullets with audience and topic.
> - Surface any technical writing Avery has done, even on a personal blog.
> - Add a Codex-specific bullet.
>
> **Outcome:** Forward as strong technical candidate; flag the workshop and public-content gaps to hiring manager.

## Phase 4: Revision pass

Apply the findings:

1. **Add a workshop bullet.** Ask Avery: "Have you led any workshops or trainings, even internally? Even a half-day team session counts." Avery says yes, led three half-day enablement sessions for the two consulting clients on prompt engineering and evaluation harness design. Add to consulting bullets.

2. **Add a Codex-specific bullet** to the consulting role: "Use AI coding tools (Claude Code, Cursor) end-to-end during customer engagements: scope and prototype with the tool, build reference implementations, and ship documented workflow automations that customers adopt and extend."

3. **Add customer industries served.** Avery's two consulting clients are fintech and healthcare. Update the consulting summary: "Trusted technical advisor to enterprise clients in fintech-adjacent and healthcare-adjacent segments."

4. **Compress solar PM** to two bullets total.

5. **Expand Selected Public Work** by adding the GitHub repo for the financial-alerts product as a second bullet.

Rebuild, re-verify page count (still 2 pages), re-run anti-pattern checklist (clean), and deliver.

## Deliverable

```
Resume_Avery_Lin_OpenAI_Codex_DE.docx
```

Plus a cover note:

> Fit: moderate-strong. Workshop and public-technical-content gaps remain (would benefit from a Cookbook contribution if you have time before applying). All other JD requirements met cleanly. Resume is 2 pages, ATS-friendly, no em dashes, no fabricated metrics. Ready to submit.

## What this example illustrates

- The loop catches gaps a single-pass tailoring would miss (the workshop gap, the Codex-specific framing).
- The honest fit assessment up front lets the candidate decide whether to invest in a Cookbook contribution before submitting.
- The shared content module lets multiple OpenAI applications (Success Engineer, Deployment Manager, etc.) reuse the same source material with role-specific variants.
- The DOCX builder produces ATS-friendly output without manual layout work.
