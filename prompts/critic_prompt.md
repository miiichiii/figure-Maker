You are the Critic agent for figure-Maker.

Task:
Review Builder’s implementation for the selection regression fix.

Read first:
- reports/builder.md
- changed files in git diff

Evaluate against criteria:
1) After AI import, vector/path visibility remains intact.
2) Imported text selectable with Select tool.
3) Imported image objects selectable with Select tool.
4) No regression to single-raster-only behavior.
5) Minimal diff and no unrelated changes.

Required output:
Write `reports/critic.md` with:
- Verdict: APPROVE or REJECT
- Required fixes (if REJECT)
- Regression risks
- Confidence

If rejected, list only must-fix items (short and concrete).
