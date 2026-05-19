# Templates

These are the reusable build blocks the skill uses to produce DOCX output.

## Files

- `lib.js`, Docx-js wrapper functions (Calibri 10pt, ATS-friendly layout, sensible defaults). Don't modify unless you want to change the visual style.
- `content-template.js`, Pattern for factoring shared candidate content into a content module with role-specific variants. Copy to `content.js` in your working directory and fill in with the candidate's actual material.
- `resume-template.js`, Per-resume builder. Copy once per target role, point to your content module, and compose.

## Setup

This pipeline assumes Node.js and a couple of npm packages.

You can install all necessary dependencies locally using the root `package.json`:

```bash
# In the skill root directory
npm install
```

For DOCX→PDF conversion (page count verification and visual spot-check), you also need LibreOffice headless:

```bash
# Ubuntu/Debian
apt-get install libreoffice

# macOS
brew install --cask libreoffice
```

## Automated Build & Anti-Pattern Linter Pipeline

We provide a built-in automated build utility in the root `scripts/build-resume.js` that checks for anti-patterns and compiles your resume.

### How to use it:

1. **Create a working folder and copy templates**:
   ```bash
   mkdir resumes && cd resumes
   cp /path/to/skill/templates/lib.js .
   cp /path/to/skill/templates/content-template.js ./content.js
   cp /path/to/skill/templates/resume-template.js ./build_my_role.js
   ```

2. **Edit `content.js` and `build_my_role.js`** with your candidate information.

3. **Run the automated lint & compile**:
   ```bash
   # From your working folder, run:
   node /path/to/skill/scripts/build-resume.js
   ```

This tool will automatically:
- **Lint** your source files (`content.js` and `build_*.js`) for anti-patterns (em-dashes, double-hyphens, and AI clichés like "leveraged", "delved", or "tapestry").
- **Compile** the DOCX file.
- **Convert** the DOCX to PDF using headless LibreOffice.
- **Verify** the page count using `pdfinfo` and warn you if the resume is longer than 2 pages.
- **Render** a PNG preview of the first page using `pdftoppm`.

To run *only* the anti-pattern check without building:
```bash
node /path/to/skill/scripts/build-resume.js --lint-only
```
```

## DOCX to PDF (for page count verification)

```bash
# Convert
libreoffice --headless --convert-to pdf Resume_*.docx

# Check page count
pdfinfo Resume_*.pdf | grep Pages

# Visual spot-check (render page 1 to PNG)
pdftoppm -r 130 -f 1 -l 1 Resume_*.pdf page -png
```

If a resume runs over two pages, tighten:
- Drop secondary roles to short variants.
- Compress skill sections to 3-4 categories.
- Remove "Additional" sections that aren't pulling weight.
- Tighten the summary.

## Style overrides

To change the font, accent color, font sizes, or margins, edit the constants at the top of `lib.js`:

```js
const FONT = "Calibri";          // try "Helvetica", "Inter", "Source Sans"
const ACCENT = "1B4F72";         // hex without #, try "0F4C75", "8B4513", "222222"
const BODY_SIZE = 20;            // half-points: 20 = 10pt; 22 = 11pt
const SECTION_SIZE = 22;
const NAME_SIZE = 44;            // 44 = 22pt
const PAGE_MARGIN_TWIPS = 1080;  // 1080 = 0.75 inch; 1440 = 1.0 inch
```

For ATS safety, keep:
- Single column layout
- Standard section headers
- No images
- No tables for layout
- No headers / footers

These are the defaults; don't override unless you have a specific reason.
