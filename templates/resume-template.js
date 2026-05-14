/**
 * resume-template.js
 *
 * Per-resume builder template. Copy this file once per target role,
 * import shared content from content.js, and compose the role-specific
 * structure.
 *
 * Pattern:
 *   1. Build a children array using helper functions.
 *   2. Order experience by relevance to the target JD, not chronologically.
 *   3. Pick the right variant for each role (CUSTOMER vs ENG vs PROGRAM).
 *   4. Choose the right clearance bullet level if defense / government.
 *   5. Use EDU_ENG_EMPHASIS for engineering-credibility roles.
 *
 * Usage:
 *   NODE_PATH=$(npm root -g) node resume-codex-de.js
 *
 * Output:
 *   /path/to/output/Resume_FirstLast_RoleName.docx
 */

const {
  name, contact, sectionHeader, summary, buildDoc, writeDoc,
  roleHeader, roleNote, bullet, skillLine,
} = require("./lib");
const C = require("./content"); // adapt path to your content file

function build() {
  const c = [];

  // -------- Header --------
  c.push(name("FIRST LAST"));
  c.push(contact(C.CONTACT_LINE_1));
  c.push(contact(C.CONTACT_LINE_2));

  // -------- Summary --------
  c.push(sectionHeader("Professional Summary"));
  c.push(summary(
    "Four to six sentence summary. Lead with years of experience and primary discipline. " +
    "Name the differentiating production work. Include 2-3 specific tools or domains relevant to the JD. " +
    "Close with constraint statement (clearance, travel, remote willingness)."
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
  await writeDoc(doc, "/path/to/output/Resume_FirstLast_RoleName.docx");
})();
