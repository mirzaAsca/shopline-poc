# Visual-diff harness

Side-by-side QA for migrations: prove the new SHOPLINE page is **identical** to the source. See [`../../docs/runbooks/visual-qa.md`](../../docs/runbooks/visual-qa.md) for how it fits the workflow.

## Install (first use)
```bash
npm i -D playwright pixelmatch pngjs && npx playwright install chromium
```

## Use
```bash
# 1) capture both sides at the SAME viewport (repeat for desktop + mobile)
node scripts/visual-diff/capture.mjs "<source-url>"  original desktop
node scripts/visual-diff/capture.mjs "<preview-url>" new      desktop
node scripts/visual-diff/capture.mjs "<source-url>"  original mobile
node scripts/visual-diff/capture.mjs "<preview-url>" new      mobile

# 2) compare → merged image + diff + score
node scripts/visual-diff/compare.mjs \
  --orig scripts/visual-diff/out/original \
  --new  scripts/visual-diff/out/new \
  --out  scripts/visual-diff/out/compare \
  --threshold 0.01
```

## Output (`out/compare/`)
- `<viewport>.merged.png` — **original | new** side by side (the image the agent reviews).
- `<viewport>.diff.png` — highlighted pixel differences.
- `report.json` — per-viewport mismatched-pixel `score` + `pass`, plus the `worst` score. `compare.mjs` exits non-zero if any page exceeds `--threshold`, so `tests/*.test.js` and CI can gate on it.

## Inspect — diagnosis ("what to fix", not just "different")
`compare.mjs` says *where / how much*; `inspect.mjs` says *what* and *to what value*:
```bash
node scripts/visual-diff/inspect.mjs "<source-url>" "<preview-url>" desktop --out scripts/visual-diff/out/inspect
```
Renders both pages and diffs, per element, **computed styles · text · image src/broken-state · link href · box/layout** (blind — derived from the rendered output, no knowledge of what changed), plus the pixel score. Writes to `out/inspect/`:
- `inspection.md` — the **fix-list**: per element a `property | original | replica` table (style/text/asset roots first, layout cascade last) + missing/extra elements, broken images, console errors.
- `inspection.json` — same, structured (for `tests/*.test.js` / automation).
- `<viewport>.merged.png`, `<viewport>.review.png` (downscaled, agent-viewable), `<viewport>.diff.png`.

Driver-agnostic (own Playwright Chromium) so it works even when the chrome-devtools MCP profile is locked. Test affordance: `--self-mutate <file>` mutates the replica in-page to prove blind detection.

## Notes
- Full-page screenshots capture every scroll position; both sides use the same viewport so coordinates line up.
- `compare.mjs` normalizes to a common width and pads height — fonts/anti-aliasing add score noise, so the **agent's review of the merged image** is the tie-breaker, and the score catches subtle drift the eye misses.
- `out/` is gitignored.
- **Password gate:** for a gated SHOPLINE preview, set `STOREFRONT_PASSWORD` in `.env` — `capture.mjs` submits it automatically (host-gated, so it never types it into a source-site form).
