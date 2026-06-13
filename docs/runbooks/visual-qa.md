# Runbook: Side-by-side visual QA

> Prove the new SHOPLINE page is **identical to the source** — not "looks similar". The agent must see both at once and compare every pixel of every page at matched scroll positions, at **desktop and mobile**.

## Why side-by-side (not sequential)
An agent that screenshots the original, then later the new page, must *remember* the original — unreliable. Instead we produce **one merged image: original (left) | new (right)** at the same scroll position, so the agent compares both simultaneously. Plus a **computed pixel-diff score** flags regions to scrutinize.

## The harness
`scripts/visual-diff/` (see its README):
- `capture.mjs` — given a URL + label + viewport, save a **full-page** screenshot (scrolls first so lazy content renders). On a SHOPLINE host it auto-submits `STOREFRONT_PASSWORD` (from `.env`) to clear the storefront password gate.
- `compare.mjs` — given original + new captures, **merge side-by-side**, run **pixelmatch**, emit a merged image, a diff image, and a `report.json` with a per-page/per-viewport score.
- `inspect.mjs` — the **diagnosis** layer. Renders original + replica and diffs **per-element computed styles, text, image src/broken-state, link href, and box/layout** (blind — derived purely from the rendered output), plus the pixel score. Writes `inspection.md` (the fix-list: element · property · original → replica), `inspection.json`, a `*.merged.png`, and a viewable downscaled `*.review.png`. Turns "it's different" into "**this** is what to change, **to this value**." Driver-agnostic (own Chromium), so it survives a locked chrome-devtools MCP profile.

## Protocol (per page)
- [ ] Capture **original** at desktop (e.g. 1440w) and mobile (e.g. 390w): `node scripts/visual-diff/capture.mjs <source-url> original <viewport>`
- [ ] Capture **new** (the SHOPLINE preview URL) at the same viewports + same scroll coords: `... <preview-url> new <viewport>`
- [ ] `node scripts/visual-diff/compare.mjs --orig <dir> --new <dir> --out <dir>` → merged + diff + score
- [ ] **Agent reviews the merged image** (read it) AND the score. Identical ⇒ pass.
- [ ] **If different ⇒ diagnose, don't guess:** `node scripts/visual-diff/inspect.mjs <source-url> <preview-url> <viewport>` → read `inspection.md` for the exact deltas (element · property · original → replica) and `*.review.png` for the side-by-side. Map each delta to a Bottle lever (color → `color_scheme` var, spacing/size → `style.*`, broken/missing img → `image_url()` / scrape, text → editable content) and append precise fix tasks to the active `specs/*.md`, then loop.
- [ ] Repeat for **every page** and **both breakpoints**. Scroll coordinates must match between original and new.

## Pass criteria
Per the locked decision ([../principles/migration-decisions.md](../principles/migration-decisions.md)): pixel-diff score under threshold **and** agent visual review confirms identity, **at desktop and mobile**. Auto-publish targets are fresh stores, so this gate is the report a human relies on for final live QA.

> Capture/diff requires identical-ish dimensions; `compare.mjs` normalizes width and pads height. Fonts/anti-aliasing cause noise — use the agent's visual review to overrule trivial score noise, and the score to catch what the eye misses.
