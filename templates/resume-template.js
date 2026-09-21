/**
 * resume-template.js
 *
 * Per-resume builder template. Copy this file once per target role,
 * import shared content from content.js, and compose the role-specific
 * structure.
 *
 * Pattern:
 *   1. Build a children array using helper functions.
 *   2. Order experience by relevance to the requirements matrix, then by date.
 *   3. Pick the bullet variant for this audience (CUSTOMER vs ENG vs PROGRAM).
 *   4. Set the clearance line to the level the JD names (defense / government).
 *   5. Use EDU_ENG_EMPHASIS when the matrix has a fundamentals row.
 *   6. Every bullet in content.js carries its ledger ids in a comment.
 *
 * Usage (after `npm install docx` in this directory):
 *   node build_target_role.js
 *   node ../scripts/resume-check.js ../out/Resume_FirstLast_RoleName.docx --jd jd.txt
 */

const {
  name, contact, headline, sectionHeader, summary, buildDoc, writeDoc,
  roleHeader, roleNote, bullet, skillLine,
} = require("./lib");
const C = require("./content"); // adapt path to your content file

const OUTPUT = "../out/Resume_FirstLast_RoleName.docx";

function build() {
  const c = [];

  // -------- Header --------
  c.push(name("FIRST LAST"));
  c.push(contact(C.CONTACT_LINE_1));
  c.push(contact(C.CONTACT_LINE_2));
  c.push(headline("Target Title As The JD Names It")); // optional; drop if the ledger does not support the title

  // -------- Summary --------
  c.push(sectionHeader("Professional Summary"));
  c.push(summary(
    "Three to five sentences. Years and discipline; the differentiating production work; " +
    "two or three tools or domains the matrix's hard rows name; a closing constraint that " +
    "pre-answers a knockout question (clearance, location, remote stance, authorization)."
  ));

  // -------- Relevant Experience --------
  c.push(sectionHeader("Relevant Experience"));

  // Most relevant role first (not necessarily most recent)
  c.push(roleHeader(C.ROLE_1_HEADER));
  c.push(roleNote("Optional italic note describing the role's purpose."));
  c.push(...C.ROLE_1_BULLETS_CUSTOMER); // pick the variant matching the JD audience

  // Second-most-relevant role
  c.push(roleHeader(C.ROLE_2_HEADER));
  c.push(...C.ROLE_2_BULLETS_FULL);

  // -------- Selected Technical Skills --------
  c.push(sectionHeader("Selected Technical Skills"));
  c.push(skillLine(
    "Category Name",
    "Specific items separated by commas; do not include aspirational skills"
  ));
  c.push(skillLine(
    "Another Category",
    "More specific items"
  ));
  // Aim for 3-5 categories total.

  // -------- Selected Public Work (if appropriate) --------
  c.push(sectionHeader("Selected Public Work"));
  c.push(...C.PUBLIC_WORK);

  // -------- Clearance (if defense / government) --------
  c.push(sectionHeader("Clearance & Eligibility"));
  c.push(C.CLEARANCE_BULLET); // or _SECRET or _TS

  // -------- Education --------
  c.push(sectionHeader("Education"));
  c.push(...C.EDU); // or C.EDU_ENG_EMPHASIS

  return c;
}

// ----- Run -----
(async () => {
  const doc = buildDoc(build());
  await writeDoc(doc, OUTPUT);
})();
