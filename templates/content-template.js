/**
 * content-template.js
 *
 * Example pattern: when building multiple tailored resumes for one candidate,
 * factor out shared content into a content module with role-specific variants.
 *
 * This template shows the pattern. Adapt it for the specific candidate.
 *
 * Usage:
 *   - Each role's experience description has a "header" (title / org / dates).
 *   - Each role has several variant "bullet sets", one per audience type.
 *   - Each per-resume script imports lib.js + this content module and composes
 *     a tailored deck by picking the right variants for the target role.
 *
 * Why this pattern: tailoring 5-15 resumes from a shared profile is much faster
 * and more consistent when shared content lives in one file. Diff hygiene also
 * stays clean.
 */

const { roleHeader, roleNote, bullet, skillLine, eduLine } = require("./lib");

// ============================================================
// Contact lines
// ============================================================

const CONTACT_LINE_1 = [
  "City, ST  |  ",
  "name@example.com",
  "  |  (555) 555-5555",
];

const CONTACT_LINE_2 = [
  { link: "https://linkedin.com/in/yourname", text: "linkedin.com/in/yourname" },
  "  |  ",
  { link: "https://yoursite.example", text: "yoursite.example" },
];

// ============================================================
// Role 1: Most recent / most relevant role, multiple variants
// ============================================================

const ROLE_1_HEADER = {
  title: "Most Recent Title",
  org: "Most Recent Company",
  dates: "2022 – Present",
};

// Variant A: customer-facing framing
const ROLE_1_BULLETS_CUSTOMER = [
  bullet("Bullet describing customer-facing work in this role with named tools and concrete outcomes."),
  bullet("Another bullet calibrated to the customer-facing audience."),
];

// Variant B: engineering framing
const ROLE_1_BULLETS_ENG = [
  bullet("Bullet describing the engineering work with specific stack and architecture."),
  bullet("Another bullet calibrated to the engineering audience."),
];

// Variant C: program / PM framing
const ROLE_1_BULLETS_PROGRAM = [
  bullet("Bullet describing PM / program work with named methodologies."),
  bullet("Another bullet calibrated to the program-management audience."),
];

// ============================================================
// Role 2: A second role with similar variant structure
// ============================================================

const ROLE_2_HEADER = {
  title: "Earlier Title",
  org: "Earlier Company",
  dates: "2018 – 2022",
};

const ROLE_2_BULLETS_FULL = [
  bullet("Detailed bullet for a role that needs full description."),
  bullet("More detail."),
];

const ROLE_2_BULLETS_SHORT = [
  bullet("Compressed two-line summary for resumes where this role is supporting context."),
];

// ============================================================
// Education
// ============================================================

const EDU = [
  eduLine({
    school: "School Name",
    degree: "Degree Type, Field of Study",
    detail: "Optional detail like honors, coursework, or certifications",
  }),
];

// Variant: foreground quantitative / engineering coursework
const EDU_ENG_EMPHASIS = [
  eduLine({
    school: "School Name",
    degree: "Degree Type, Field of Study",
    detail: "Relevant quantitative coursework: list specific courses",
  }),
];

// ============================================================
// Clearance bullets (defense / government roles only)
// ============================================================

const CLEARANCE_BULLET = bullet(
  "U.S. citizen; willing to apply for and maintain a U.S. security clearance and to work in DDTC-registered, ITAR-compliant facilities."
);

const CLEARANCE_BULLET_SECRET = bullet(
  "U.S. citizen; willing to apply for and maintain a U.S. Secret security clearance and to work in DDTC-registered, ITAR-compliant facilities."
);

const CLEARANCE_BULLET_TS = bullet(
  "U.S. citizen; willing to apply for and maintain a U.S. Top Secret security clearance and to work in DDTC-registered, ITAR-compliant facilities."
);

// ============================================================
// Selected Public Work (customer-facing / engineering roles)
// ============================================================

const PUBLIC_WORK = [
  bullet("Public site or methodology page (URL), what it demonstrates."),
  bullet("Productized service / SaaS / public artifact (URL), what it demonstrates."),
];

module.exports = {
  CONTACT_LINE_1, CONTACT_LINE_2,
  ROLE_1_HEADER, ROLE_1_BULLETS_CUSTOMER, ROLE_1_BULLETS_ENG, ROLE_1_BULLETS_PROGRAM,
  ROLE_2_HEADER, ROLE_2_BULLETS_FULL, ROLE_2_BULLETS_SHORT,
  EDU, EDU_ENG_EMPHASIS,
  CLEARANCE_BULLET, CLEARANCE_BULLET_SECRET, CLEARANCE_BULLET_TS,
  PUBLIC_WORK,
};
