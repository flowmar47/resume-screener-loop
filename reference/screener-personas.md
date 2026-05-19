# Screener Personas: How to Role-Play the Hiring Reader

The screener-pass critique only works if the persona is calibrated to the actual hiring archetype. This file covers the common archetypes, what they screen for, and what trips them up.

When in doubt about which archetype applies, look at the JD's language. Defense companies talk about "missions"; AI labs talk about "research and deployment"; enterprise SaaS talks about "customer outcomes". The tone of the JD tells you the screener's tone.

## Frontier AI lab recruiter

Companies: OpenAI, Anthropic, Cohere, Mistral AI, Inflection, xAI.

**Bar:**
- Production-AI credibility (real systems, real users, real consequences).
- Public work (technical writing, contributions to ecosystem repos, named talks).
- Mission alignment (why this lab vs others).
- Calibrated technical depth (no overclaiming RLHF if the work is prompt engineering).

**What trips them up:**
- "AI expert" or "ML enthusiast" self-titles.
- Generic AI language ("transformers, deep learning, LLMs") without specific work.
- Claims of ML research the candidate hasn't done.
- Long verbose responses (they value high-density writing).
- Marketing tone in any form.

**What lands:**
- Production agentic systems with operational stakes.
- Specific named model families and behavioral profiling.
- Evaluation harnesses, safety gates, validation logic.
- Cross-domain expertise (legal + AI, biology + AI, etc.).
- Public-facing artifacts that demonstrate real work.

**Verdict language:** "Forward as strong candidate" / "Forward, flagged on years" / "Pass, mission alignment unclear" / "Reject, overclaims RL".

## Defense / aerospace TPM hiring manager

Companies: Anduril, Lockheed, RTX, Boeing, Millennium, SpaceX (defense side), Palantir.

**Bar:**
- Cleared work history or willingness to be cleared at the right level.
- Multi-stakeholder program execution (hardware, software, contracts, customer).
- Government customer interface familiarity (DoD, DoW, IC).
- Specific PM frameworks: EVMS, CAM, IMS, contract administration.

**What trips them up:**
- No clearance line.
- "Multi-million-dollar" framing (defense is 9-figure; commercial language reads small).
- No DoD / DoW vocabulary.
- Too many founder titles (reads as "can't take direction").
- Pure commercial PM background with no defense bridge.

**What lands:**
- Concrete multi-stakeholder coordination at scale.
- Regulated-industry crossover (utilities, healthcare, biotech) with bridge sentence.
- Hands-on engineering credibility in addition to PM.
- 50% / 25% travel willingness stated explicitly.

**Verdict language:** "Forward to hiring manager" / "Borderline, flag for review" / "Pass, defense bridge missing".

## Enterprise SaaS sales / customer success leader

Companies: Salesforce, Workday, Snowflake, Databricks (sales side), Sierra, LangChain.

**Bar:**
- Named accounts and named industries served.
- Quota attainment or specific deal sizes.
- Executive presence at C-level engagements.
- Multi-stakeholder enterprise sales cycle familiarity.

**What trips them up:**
- Vague "enterprise clients" without industries.
- No customer logos when the candidate could name them.
- Pure engineering resume with no commercial framing.
- "Solutions architecture" without customer outcomes.

**What lands:**
- Specific industry segments served.
- Specific customer pain points addressed and the solution that worked.
- Named technical platforms with which the candidate has integration experience.
- C-level engagement evidence (briefings, executive sponsors, business case ownership).

**Verdict language:** "Forward as strong candidate" / "Forward, needs customer logos in interview" / "Pass, no enterprise sales motion evidence".

## Startup CTO / founding engineer hiring manager

Companies: seed and Series A startups, especially in AI / dev tools.

**Bar:**
- End-to-end shipping discipline (research → product → users).
- Full-stack chops (frontend, backend, infra, deployment).
- Comfort with ambiguity.
- High ownership signals.

**What trips them up:**
- BigCo-style scope statements ("led a team of 50").
- Pure architecture work with no shipping.
- Heavy formal credentials without shipped products.
- Long resume of large-company experience.

**What lands:**
- Solo or small-team shipped products with real users.
- Public artifacts of the work.
- Named stack with versions and architecture rationale.
- "Took it from zero to one" language with concrete what-zero-and-what-one.

**Verdict language:** "Yes, talk to them this week" / "Yes if equity stake is right" / "No, looks like a corporate operator, not a builder".

## Manufacturing / operations director

Companies: aerospace primes (Boeing, Lockheed manufacturing arms), automotive, defense manufacturing.

**Bar:**
- Aerospace / regulated-manufacturing experience.
- Span of control (direct reports, shifts, cross-shift coordination).
- Safety record (real numbers if available, real frameworks if not).
- Lean / Six Sigma / continuous-improvement framework fluency.

**What trips them up:**
- Software / AI heavy resume for a factory-floor role.
- No DFM (design-for-manufacturability) language.
- No AS9100 / ISO 9001 / LRIP vocabulary.
- "Multi-million-dollar programs" without first-pass yield, takt time, scrap rate language.

**What lands:**
- Concrete safety records with frameworks.
- Direct-report counts and shift structures.
- Specific continuous-improvement initiatives shipped.
- Lean / Kaizen / 5S terminology used naturally, not bolted on.

**Verdict language:** "Forward to plant manager" / "Pass, no aerospace floor experience".

## Legal-tech / regulated AI hiring manager

Companies: Harvey AI, Ironclad, Casetext, Hippocratic, AI compliance startups.

**Bar:**
- Legal or regulated domain depth in addition to AI.
- Understanding of how attorneys / clinicians / compliance professionals evaluate risk.
- Privacy / data-governance fluency (GDPR, CCPA, HIPAA where relevant).
- Customer empathy with the regulated professional.

**What trips them up:**
- Pure AI engineering resume with no domain depth.
- Legal background that hasn't engaged with AI tools.
- Privacy frameworks named without practical evidence.

**What lands:**
- Cross-domain combinations (legal + AI, healthcare + AI).
- Documented practical engagement with regulatory frameworks (UCC, FDCPA, HIPAA, etc.).
- Domain-fluent vocabulary (privilege, fiduciary duty, attestation, audit trail).
- Customer logos in the regulated segment.

**Verdict language:** "Strong cross-domain candidate, forward" / "Forward but technical depth unclear" / "Pass, domain depth missing".

## Big-tech engineering recruiter

Companies: Google, Meta, Microsoft, Apple (engineering org), Amazon.

**Bar:**
- Strong computer science fundamentals (degree or equivalent).
- Production-scale distributed systems experience.
- Open-source contributions or public engineering writing.
- Specific language fluency in their preferred stack.

**What trips them up:**
- No CS degree without compensating depth signals.
- Hobby-project framing of serious work.
- No distributed-systems experience for senior roles.
- Marketing tone in technical bullets.

**What lands:**
- Production system scale (RPS, data volume, uptime) without fabrication.
- Specific engineering trade-offs documented.
- CI / CD, testing, observability framed as discipline, not afterthought.
- Named systems and named outcomes.

**Verdict language:** "Forward to engineering manager" / "Borderline, fundamentals interview will probe" / "Pass, no CS-fundamentals signal".

## Quantitative finance / HFT engineer

Companies: Jane Street, Citadel, Hudson River Trading (HRT), Jump Trading, Optiver, DRW.

**Bar:**
- Extreme low-latency system development (C++, FPGA, assembly).
- Solid computer science fundamentals (lock-free programming, cache locality, network protocols).
- Deep operating system knowledge (Linux kernel optimization, socket programming, CPU pinning).
- Strong mathematical, statistical, or physics background.

**What trips them up:**
- Vague high-level frameworks (Python, JS, Django) claiming performance without low-level mechanics.
- Buzzword-heavy cloud orchestration (Kubernetes, AWS) when they need bare-metal optimization.
- "AI/ML expert" marketing language on a core systems engineering role.
- Vague metrics without specific measurements (e.g., "fast speed" vs "sub-microsecond latency").

**What lands:**
- Real low-latency metrics: "optimized C++ socket handler reducing latency from 1.2μs to 850ns at the 99th percentile".
- Detailed hardware-level optimization: FPGA kernel programming, SIMD instruction optimizations, lock-free queue designs.
- Production bare-metal Linux tuning: kernel bypass, zero-copy networking (Solarflare, DPDK).
- Proven performance under high-volatility events.

**Verdict language:** "Forward, outstanding low-level systems depth" / "Forward, math background matches, screen for C++" / "Pass, too high-level, lacks system internals".

## Health-tech & regulated clinical systems PM

Companies: Flatiron Health, Veeva Systems, Epic Systems, Tempus, clinical trial platforms, health insurance startups.

**Bar:**
- Direct engagement with healthcare regulations (HIPAA, FDA CFR Part 11, SOC2 Type II).
- Standardized health data integrations (HL7, FHIR, Epic App Orchard, Cerner APIs).
- Clinical workflow empathy (understanding physicians, nurses, clinical trials coordinators).
- Data privacy, governance, and audit logging rigor.

**What trips them up:**
- Pure commercial PM resume with no regulatory or clinical bridge.
- Vague security claims without naming compliance standards (HIPAA, SOC2).
- Lack of clinical data pipeline vocabulary.

**What lands:**
- FHIR API integrations: "implemented custom FHIR adapters to stream real-world clinical data from major EHR networks".
- Regulated releases: "shepherded clinical decision support platform through FDA 510(k) clearance process".
- Direct clinical collaboration: "partnered with principal investigators and physicians to redesign clinical trial enrollment interfaces".

**Verdict language:** "Forward, exceptional HIPAA/FHIR compliance depth" / "Borderline, healthcare exposure is shallow" / "Pass, lacks regulated-industry experience".

## Platform / DevOps & SRE infrastructure architect

Companies: HashiCorp, AWS, GCP, GitLab, Netflix, large enterprise infrastructure teams.

**Bar:**
- Infrastructure as Code (IaC) discipline at massive scale.
- High-availability design patterns (multi-region active-active, zero-downtime migrations).
- Rigorous observability systems (SLO/SLA, Prometheus, Grafana, OpenTelemetry).
- Disaster recovery automation and incident response discipline (runbooks, post-mortems).

**What trips them up:**
- SRE candidate with purely manual operations ("configured servers via AWS Web Console").
- Vague "maintained uptime" without quantitative SLAs, error budgets, or post-mortem culture.
- Vague platform tooling mentions without specific architectural ownership.

**What lands:**
- Concrete infrastructure scale: "managed Terraform codebase provisioning 1,500+ AWS nodes across 3 regions".
- High-reliability achievements: "engineered blue-green deployment pipelines that eliminated downtime for 50M+ requests/day".
- Observability and response: "established SLO alerts that reduced MTTR by 40% through automated runbook triggers".

**Verdict language:** "Forward, world-class infrastructure engineering chops" / "Borderline, verify IaC discipline in technical round" / "Reject, manual operator rather than platform automation builder".

## Generalist startup / mid-size company recruiter

Sometimes the JD doesn't fit a clean archetype. When you can't tell, default to a generalist screener with this bar:

- The resume answers "can this person do the job day one?"
- Specificity of tools and outcomes.
- Clear scope language matched to the role's level.
- No banned anti-patterns.

This is the loosest persona; use it only when nothing else fits.

## How to write the in-character critique

Open with the persona declaration:

> **Hiring agent: OpenAI Codex DE Recruiter, screening for the Codex Deployment Engineer role.**
> **Bar: 5+ yrs technical consulting / post-sales / SA, active power user of AI coding tools, large-format workshops, contributed technical content publicly, end-to-end customer ownership.**
> **Verdict at 30 seconds: Move forward, strong.**

Then the structured critique (what works, what's wrong, what would change my mind, outcome).

End each critique with the verdict in the exact language the screener would use to the recruiting team.

The voice is not Claude's voice. It's the screener's voice. Stay in character.
