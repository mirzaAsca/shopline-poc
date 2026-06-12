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

## Notes
- Full-page screenshots capture every scroll position; both sides use the same viewport so coordinates line up.
- `compare.mjs` normalizes to a common width and pads height — fonts/anti-aliasing add score noise, so the **agent's review of the merged image** is the tie-breaker, and the score catches subtle drift the eye misses.
- `out/` is gitignored.
