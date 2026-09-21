# Agent Tooling

The skill is agent-agnostic. It needs four capabilities: read files, run shell commands (Node 18+), fetch a URL, and search the web. Use whatever your environment provides; the workflow text says "fetch" and "search" rather than naming a tool.

| Agent | Fetch a URL | Search the web | Notes |
|---|---|---|---|
| Claude Code | `WebFetch` | `WebSearch` | Skills load from `~/.claude/skills/` or `.claude/skills/`. |
| OpenAI Codex CLI | built-in web search / fetch when enabled; otherwise `curl` | same | Skills load from `~/.codex/skills/`. |
| Gemini CLI / Antigravity | `web_fetch` | `google_web_search` | `~/.gemini/skills/`, `~/.gemini/antigravity/skills/`. |
| Cursor | `@web` context or a fetch tool | same | `~/.cursor/skills/`. |
| GitHub Copilot CLI | fetch tool when enabled; otherwise `curl` | as available | `~/.copilot/skills/`. |
| OpenCode | `webfetch` | as configured | `~/.config/opencode/skills/`. |
| Others (Kiro, Cline, Roo, Trae, Continue, Qwen, Factory, pi, OpenClaw) | tool names vary; `curl` always works | as available | Each reads `SKILL.md` from its own `skills/` directory. |

## Fallbacks

**No web tool.** Fetch with the shell:

```bash
curl -sL "https://example.com/jobs/123" | sed 's/<[^>]*>/ /g' | tr -s ' \n' > jd.txt
```

If a job board blocks scripted fetches or renders the JD with JavaScript (Workday, some LinkedIn pages), ask the user to paste the JD text. Never reconstruct a JD from memory or from a similar posting.

**No Node.** Write the resume as Markdown using the section names in `templates/README.md`, convert with pandoc (`pandoc resume.md -o Resume.docx`), and run the checker on the `.md` (Python is not required; the checker is Node, so without Node use the checklists in `anti-patterns.md` by hand and say in the cover note that the mechanical gate did not run).

**No `docx` package and no network.** Ask the user to run `npm install docx` once, or fall back to pandoc as above.

**No LibreOffice.** The checker estimates page count and says so. If exactness matters (federal two-page cap), ask the user to open the DOCX and confirm the page count before submitting.

## Reading input formats

- DOCX: `node scripts/docx-text.js input.docx` prints the text an ATS would extract. Use it on the candidate's existing resume too; it shows you what parsers see.
- PDF: use your agent's PDF reader if it has one, or `pdftotext input.pdf -` when poppler is installed.
- Web profiles (LinkedIn): fetch if allowed; if blocked, ask the user to paste the profile text or export it.

## What not to do with tools

- Do not submit applications, send messages, or post anything on the candidate's behalf.
- Do not install global packages or change system configuration to make a build work; use a local `npm install docx` in the working directory.
- Do not paste the candidate's personal data into third-party scoring sites.
