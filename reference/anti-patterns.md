# Anti-Patterns: What Not to Write

This file is the enforcement checklist. Run every resume against it before declaring the draft done and again before final delivery. Each pattern below has a substitution.

## Em dashes: banned

The long dash character is banned from every resume produced by this skill. Replace it with one of the following:

| If the em dash is doing this... | Use instead |
|---|---|
| Parenthetical aside | Commas: "the system, which serves paying subscribers, runs daily" |
| Introduction or explanation | Colon: "the result was clear: subscribers stayed" |
| Joining related independent clauses | Semicolon: "data quality drove retention; errors drove cancellations" |
| Strong break / pivot in thought | Period: two sentences |
| Truly supplementary aside | Parentheses: "the pipeline (multi-source, with fallbacks) validates prices" |

This rule applies to summaries, bullets, headers, and any other text on the resume. Search the output for the character `—` before delivery. Search for `--` too in case a double-hyphen sneaks in.

## Fabricated metrics: banned

Do not invent percentages, dollar figures, user counts, or performance metrics. The screener's test is: "How did you measure that?" If the candidate doesn't have a real answer, the claim doesn't go on the resume.

**Prohibited:**
- "Reduced errors by 47%" without actual measurement
- "Improved efficiency 3x" without baseline
- "Saved 200+ hours annually" without basis
- "$50M+ in pipeline" without data
- Round numbers that look fabricated ("Trained 10,000 employees")

**Acceptable substitutions:**
- Qualitative real outcomes: "high reliability across daily automated execution"
- Verifiable structural facts: "multiple API sources with fallback chains", "strict daily SLA"
- Honest scale: "paying subscribers", "multi-year client retention", "production system"
- Credible mechanism statements: "reduced customer churn by maintaining formatting consistency"
- Team / project size when verifiable: "cross-functional teams of 15+"

**Permitted if true and verifiable:**
- Years of experience ("seven plus years")
- Team size ("15+ cross-functional")
- Cohort size if real ("portfolio across multi-year engagements")
- Concrete safety facts ("zero safety incidents across all managed projects")
- Named technical scale facts ("8x8 grid", "9-section briefing", "13-module program") when these are real product / system facts

## Marketing-tone language: banned

Banned phrasing categories:

**Superlatives without evidence:**
- "world-class"
- "best-in-class"
- "cutting-edge"
- "unparalleled"
- "groundbreaking"
- "industry-leading"

**Empty intensifiers (banned unless followed by concrete evidence in the same sentence):**
- "passionate about"
- "thrilled to"
- "incredibly excited"
- "deeply committed"
- "highly motivated"

**Vague impact claims:**
- "transformed"
- "revolutionized"
- "drove massive impact"
- "game-changing"
- "next-generation"

**Self-awarded titles:**
- "AI expert"
- "ML enthusiast"
- "thought leader"
- "visionary"
- "guru"
- "ninja", "rockstar", "wizard"

**Preferred substitutes:**
- Specific action verbs: built, designed, implemented, maintained, coordinated, operated, architected, deployed, debugged, evaluated, integrated, owned, shipped
- Specific outcomes (without fabricated numbers): "ran unattended", "consistent delivery", "long-term retention", "zero safety incidents"
- Honest qualifiers: "production", "paying subscribers", "multi-source", "daily automated"

## Buzzword stacking: discouraged

Each technology name carries weight only if accompanied by context. Lists of named tools without context look like LinkedIn skill sections, not credible production claims.

**Bad:** "Skills: Kubernetes, Terraform, AWS, GCP, Azure, Docker, Kafka, Redis, PostgreSQL, MongoDB, Snowflake, Databricks, Spark, Airflow"

**Better:** Group by category with context: "Container orchestration: Docker (production); Kubernetes (familiar from learning)", honest qualifier on Kubernetes.

**Best:** "Built and operate a Docker-containerized data pipeline on Ubuntu Server with Prometheus and Grafana observability; Kubernetes familiarity through learning, not yet operated in production."

## Overclaimed expertise: banned

Do not claim work the candidate hasn't done.

| If the candidate has... | Do not claim... |
|---|---|
| Python + Swift production work | "Production C / C++" |
| Prompt engineering, agent orchestration | "RLHF", "PPO", "policy gradients", "reward modeling" |
| Self-hosted LLM deployment | "Trained foundation models" |
| Used Tailscale + AES-256 | "Designed a custom cryptographic protocol" |
| Run scripts on a Raspberry Pi | "Embedded systems engineer" |
| Used Excel for project tracking | "Built data warehouses" |

Honest framing for adjacent expertise is fine. "Actively reading C and C++ in toolchain contexts" is acceptable; "production C and C++" without that work is not.

## Self-referential framing: discouraged

Bullets like "Demonstrates the same FDE pattern OpenAI ships" or "Mirrors the pattern Anthropic uses" read as flattery to the reader. They imply the candidate is trying to convince the reader rather than describing the work. State what was built and let the reader draw the inference.

**Bad:** "Built X. Demonstrates the same FDE pattern [Target Company] ships."

**Good:** "Built X." (then describe X concretely)

## Founder-title overuse: watch for

If the candidate is a founder of multiple ventures, three "Founder" titles in a row on a resume telegraphs "may not take direction well" to corporate hiring managers. Soften one or two while preserving the credibility of the work:

- Founder → Co-Founder & Principal Consultant
- Founder → Principal Architect
- Founder → Lead Engineer

The operative noun should be the work, not the title.

## "Multi-million-dollar": calibrate

For commercial / sales / general PM roles, "multi-million-dollar" is fine and lands as expected.

For defense / aerospace / government roles, "multi-million-dollar" reads as commercial-scale. Defense programs are 9-figure. Use "complex multi-stakeholder programs" or describe program complexity instead.

For startup / SaaS roles, "multi-million-dollar" can read as enterprise-overbuilt. Use "production systems" or "real-business-consequence systems" instead.

## Final checklist (run before delivery)

- [ ] No em dashes anywhere (search the output)
- [ ] No fabricated percentages, dollar figures, or counts
- [ ] No "world-class", "passionate about", "thrilled to", or similar
- [ ] No claims of ML research the candidate hasn't done
- [ ] No "AI expert" or self-awarded titles
- [ ] No more than two "Founder" titles in a row
- [ ] Specific tools named only where the candidate used them
- [ ] Clearance line matches the JD's required level (Secret vs Top Secret)
- [ ] Industry segments served are named for customer-facing roles
- [ ] All bullets pass the test: "How did you measure / verify / produce that?"
- [ ] Page count is 1-2 pages unless JD invites a CV
