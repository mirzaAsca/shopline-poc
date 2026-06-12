# Runbook: Side-by-side visual QA

> Prove the new SHOPLINE page is **identical to the source** — not "looks similar". The agent must see both at once and compare every pixel of every page at matched scroll positions, at **desktop and mobile**.

## Why side-by-side (not sequential)
An agent that screenshots the original, then later the new page, must *remember* the original — unreliable. Instead we produce **one merged image: original (left) | new (right)** at the same scroll position, so the agent compares both simultaneously. Plus a **computed pixel-diff score** flags regions to scrutinize.

## The harness
`scripts/visual-diff/` (see its README):
- `capture.mjs` — given a URL + label + viewport, save full-page (and per-scroll-band) screenshots.
- `compare.mjs` — given original + new captures, **merge side-by-side**, run **pixelmatch**, emit a merged image, a diff image, and a `report.json` with a per-page/per-viewport score.

## Protocol (per page)
- [ ] Capture **original** at desktop (e.g. 1440w) and mobile (e.g. 390w): `node scripts/visual-diff/capture.mjs <source-url> original <viewport>`
- [ ] Capture **new** (the SHOPLINE preview URL) at the same viewports + same scroll coords: `... <preview-url> new <viewport>`
- [ ] `node scripts/visual-diff/compare.mjs --orig <dir> --new <dir> --out <dir>` → merged + diff + score
- [ ] **Agent reviews the merged image** (read it) AND the score. Identical ⇒ pass; differences ⇒ create/append fix tasks in the active `specs/*.md` and loop.
- [ ] Repeat for **every page** and **both breakpoints**. Scroll coordinates must match between original and new.

## Pass criteria
Per the locked decision ([../principles/migration-decisions.md](../principles/migration-decisions.md)): pixel-diff score under threshold **and** agent visual review confirms identity, **at desktop and mobile**. Auto-publish targets are fresh stores, so this gate is the report a human relies on for final live QA.

> Capture/diff requires identical-ish dimensions; `compare.mjs` normalizes width and pads height. Fonts/anti-aliasing cause noise — use the agent's visual review to overrule trivial score noise, and the score to catch what the eye misses.
