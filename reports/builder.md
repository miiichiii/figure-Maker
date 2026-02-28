# Builder Report

## Hypothesis
AI import output is visible but often non-selectable because pointer-event based hit testing misses imported elements (especially when PDF->SVG output has unusual paint/pointer state). Existing selection path relies mainly on DOM hit targets (`closestEditableTarget` / `elementsFromPoint`).

## Changes
- `index.html`
  - In `canvas.pointerdown` handler:
    - Added fallback target discovery via bbox-based hit test when pointer-event hit fails:
      - `findEditableTargetByBBoxPoint(...)`
      - `findNearestEditableTargetByPoint(...)`
    - Updated target resolution to use fallback candidates.
    - For fallback hits on `image/text/tspan`, select direct element instead of forcing outer group.

## Why this should work
Even when browser pointer-event hit testing fails on imported SVG nodes, bbox-based fallback still finds editable elements by geometry, allowing selection to start and preserving drag/selection flow.

## Quick Regression Checklist
- [x] Change scope limited to selection handler logic.
- [x] No AI import architecture changes.
- [x] No rendering pipeline changes (vector/image import untouched).
- [x] Existing direct/black-arrow branching preserved.
