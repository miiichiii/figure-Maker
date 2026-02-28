# TODO (Builder/Critic loop)

- [ ] Define deterministic Builder prompt for selection bug (text/image not selectable after AI import)
- [ ] Run Builder (Codex) to implement minimal-diff fix and write `reports/builder.md`
- [ ] Run Critic (Codex) to review changes and write `reports/critic.md`
- [ ] If Critic rejects: apply required-only fixes and rerun Critic once
- [ ] Verify acceptance criteria locally (at least static checks + diff scope)
- [ ] Report summary to user

## Acceptance Criteria
- [ ] After AI import, vector/path visibility is preserved
- [ ] Imported text is selectable with select tool
- [ ] Imported image objects are selectable with select tool
- [ ] No regression to "single raster background only" mode
- [ ] No unrelated file churn
