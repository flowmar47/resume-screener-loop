# Batch Workflow: Several Jobs in One Session

Share the expensive upstream work (ledger, discovery) across jobs; never share the screen. Each job gets its own matrix, draft, gate, three-reader screen, and convergence.

## Detecting batch mode

Several JD URLs or pastes; phrases like "these three roles", "batch", "apply to all of these"; a list of company and title pairs. Confirm:

> I see {n} target roles. I will read your material once, build one ledger, ask any questions once, and then tailor and screen each role separately. Proceed?

## Shared phases

1. **Ledger** once (`evidence-ledger.md`).
2. **One matrix per JD** (`requirements-matrix.md`). Give each job a slug (`acme-senior-backend`, `openai-deployment-eng`).
3. **Cross-job gap map**: union of hard and soft rows across the matrices, each tagged with the jobs it appears in.

| Requirement | Jobs | Ledger evidence | Status |
|---|---|---|---|
| Workshops for engineering teams | 2 of 3 | none | ask |
| Public technical writing | 3 of 3 | site only | partial |
| Production Kubernetes | 1 of 3 | none | gap (job-specific) |

4. **One discovery batch**, five questions, ordered by leverage: rows in three or more jobs first, then two, then one (`experience-discovery.md`). Tag each answer with the jobs it serves.
5. **Fit tier per job**, never averaged. Report all tiers together so the candidate can drop weak ones before drafting.

## Per-job phases

For each slug: draft from the shared content module with role-specific bullet variants (`templates/content-template.js`), build, run the checker against that job's JD and hard rows, screen with the persona that matches that company, revise, converge. Do not skip a job's screen to save time; it is the point of the loop.

## Working directory

```
batch_2026-09-21/
  work/ledger.md
  work/matrix_<slug>.md
  work/jd_<slug>.txt
  content.js
  build_<slug>.js
  out/Resume_First_Last_<Company>_<Role>.docx and .txt
  out/cover_notes.md
```

```bash
node /path/to/resume-screener-loop/scripts/build-resume.js            # builds every build_*.js and checks each output
node /path/to/resume-screener-loop/scripts/resume-check.js out/Resume_..._Acme_Senior_Backend.docx --jd work/jd_acme-senior-backend.txt --must "Go,Kubernetes"
```

## Cross-job synthesis

After every job has been screened, write a short pattern note:

- Findings that recurred across most jobs (a missing artifact, an unverifiable scope claim, a title that reads junior). These are profile problems, and one fix serves every application.
- Framings that landed in more than one screen; reuse them.
- Roles the candidate should not apply to, with the matrix row that says why.
- Ledger rows worth adding to the candidate's master material for next time.

## Deliverables

A zip of the final DOCX and text files; per-job cover notes (or one note with sections); the cross-job pattern note; the fit tiers in one table.
