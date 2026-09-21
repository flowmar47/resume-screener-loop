# Templates

The DOCX builder the loop uses. Node plus the `docx` package; the output is ATS-safe by construction: US Letter, single column, real heading paragraphs with a bottom border, real bullet numbering, no tables, images, headers, or footers.

## Files

- `lib.js`: docx-js helpers (Calibri 10pt body, 11pt section headers, 22pt name, 0.75-inch margins). Constants at the top control font, accent color, sizes, margins, and paper size.
- `content-template.js`: pattern for factoring one candidate's material into a content module with per-audience variants. Copy to `content.js` and fill from the ledger.
- `resume-template.js`: per-target builder. Copy once per role, import the content module, compose in matrix order.

## Setup

```bash
mkdir -p work out && cd work
cp /path/to/resume-screener-loop/templates/lib.js .
cp /path/to/resume-screener-loop/templates/content-template.js ./content.js
cp /path/to/resume-screener-loop/templates/resume-template.js ./build_target_role.js
npm init -y >/dev/null && npm install docx
```

Install locally in the working directory; do not install globally.

Optional, for exact page counts and PDF output: LibreOffice (`brew install --cask libreoffice` on macOS, `apt-get install libreoffice` on Debian and Ubuntu). Without it the checker estimates pages and says so.

## Build one resume

1. Fill `content.js` from the ledger. Every bullet you write should have ledger ids in a trailing comment while you work.
2. In `build_target_role.js`, compose sections in the order the matrix calls for, pick the bullet variants for this audience, set the clearance line if needed, set the output path.
3. Build and check:

```bash
node build_target_role.js
node /path/to/resume-screener-loop/scripts/resume-check.js ../out/Resume_First_Last_Company_Role.docx \
  --jd jd.txt --must "Go,Kubernetes" --text ../out/Resume_First_Last_Company_Role.txt
```

Fix blockers and majors, rebuild, rerun. The `--text` output is the plain-text deliverable for paste-in application forms.

## Batch tailoring

One `build_*.js` per target role, all importing the same `content.js`. The orchestrator runs every one and checks each output:

```bash
node /path/to/resume-screener-loop/scripts/build-resume.js --preview
# or per role, with that role's JD and hard requirements:
node /path/to/resume-screener-loop/scripts/build-resume.js build_acme.js --jd jd_acme.txt --must "Go,Kubernetes"
```

Output files: `Resume_First_Last_Company_Role.docx` and `.txt`; letters, digits, and underscores only.

## PDF and exact page count

```bash
node /path/to/resume-screener-loop/scripts/render-pdf.js ../out/Resume_First_Last_Company_Role.docx
```

The checker renders the PDF itself when LibreOffice is installed (on the PATH or in the usual application folders) and reports the measured count; it uses an isolated LibreOffice profile and a 15-second timeout so a running LibreOffice window or a restrictive sandbox cannot stall it. Without LibreOffice it estimates and says so. Over budget: shorten older roles to two bullets, merge skill lines, cut the weakest lead-role bullet, tighten the summary.

## Style overrides

Edit the constants at the top of `lib.js`:

```js
const FONT = "Calibri";          // Cambria, Georgia, Garamond, Arial, Lato, Inter also parse fine
const ACCENT = "1B4F72";         // hex without #; one accent color only
const BODY_SIZE = 20;            // half-points: 20 = 10pt, 22 = 11pt
const SECTION_SIZE = 22;
const NAME_SIZE = 44;            // 22pt
const PAGE_MARGIN_TWIPS = 1080;  // 0.75 inch; 720 = 0.5 inch (federal), 1440 = 1 inch
```

Paper size is set in `buildDoc()`; the default is US Letter (12240 x 15840 twips). For A4 markets use 11906 x 16838 and run the checker with `--paper a4`.

Keep, regardless of overrides: one column, standard section names, no tables for layout, no images, nothing in headers or footers. The checker flags every one of these.

## Without Node

Write the resume as Markdown with the same section names (Professional Summary, Experience, Selected Technical Skills, Education) and role header lines of the form `Title | Organization | Mon YYYY – Mon YYYY`, convert with `pandoc resume.md -o Resume.docx`, and run the checker on the `.md` or the `.docx`. Pandoc's default DOCX is single-column with real headings and bullets.
