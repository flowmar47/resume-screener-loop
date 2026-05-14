# Templates

These are the reusable build blocks the skill uses to produce DOCX output.

## Files

- `lib.js`, Docx-js wrapper functions (Calibri 10pt, ATS-friendly layout, sensible defaults). Don't modify unless you want to change the visual style.
- `content-template.js`, Pattern for factoring shared candidate content into a content module with role-specific variants. Copy to `content.js` in your working directory and fill in with the candidate's actual material.
- `resume-template.js`, Per-resume builder. Copy once per target role, point to your content module, and compose.

## Setup

This pipeline assumes Node.js and a couple of npm packages.

```bash
# In your working directory
npm install docx --global       # or local; either works
```

For DOCX→PDF conversion (page count verification and visual spot-check), you also need LibreOffice headless:

```bash
# Ubuntu/Debian
apt-get install libreoffice

# macOS
brew install --cask libreoffice
```

## Build pipeline

Pattern for building one resume:

```bash
# Make a working directory
mkdir resumes && cd resumes

# Copy the templates
cp /path/to/skill/templates/lib.js .
cp /path/to/skill/templates/content-template.js ./content.js
cp /path/to/skill/templates/resume-template.js ./build_target_role.js

# Edit content.js with the candidate's actual experience
# Edit build_target_role.js with the role-specific composition

# Build
NODE_PATH=$(npm root -g) node build_target_role.js
# Wrote: /path/to/output/Resume_FirstLast_RoleName.docx
```

For multiple resumes (batch tailoring), create one `build_*.js` script per target role and run them in sequence:

```bash
for f in build_*.js; do
  NODE_PATH=$(npm root -g) node "$f"
done
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
