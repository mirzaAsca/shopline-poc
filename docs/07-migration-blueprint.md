# 07 — Migration Blueprint (target side)

High-level pipeline for **any platform → SHOPLINE (Bottle)** migration. The **source-scraping side is intentionally not specified here** (separate workstream); this doc nails down where it plugs into the verified SHOPLINE/Bottle target side (docs 01–06).

## Modes

- **1:1** — reproduce the source UI/UX as closely as Bottle allows (map source blocks → nearest Bottle sections; derive colors/fonts from the source).
- **Redesign** — keep source *content/IA*, apply a fresh Bottle-native design (drive look via `theme.config.json` color schemes + `font`/`layout` global settings).

## Pipeline phases

```
[0 Intake] → [1 Scan*] → [2 Extract*] → [3 Map] → [4 Build] → [5 Deploy] → [6 Validate] → [7 Report]
                  └──────── * source side, out of scope for these docs ────────┘
```

### 0 — Intake
Inputs: source URL, mode (1:1 | redesign), target `${SL_STORE}` + `${SL_THEME_ID}` (a clean Bottle), credentials in `.env`. Confirm CLI auth (`sl theme list`) and Admin API token (`${SL_TOKEN}`).

### 1 — Scan *(out of scope here)*
Crawl source: navigation tree, page inventory, routes, page types (home, product, collection, blog, static, contact…), assets. → produces a **site map + page-type classification**.

### 2 — Extract *(out of scope here)*
Per page: structured content (headings, copy, images, links, products), layout/section decomposition, brand tokens (palette, type, spacing), media assets. → produces a normalized **content model** per page.

### 3 — Map (source content model → Bottle)
Deterministic mapping using the [§ migration cheat-sheet](04-bottle-theme-architecture.md#migration-mapping-cheat-sheet-source--bottle):
- each source section → a Bottle **section type** + block layout
- each text/image/link → block **settings** (`heading.text`, `rich-text.content`, image/link settings)
- brand tokens → `theme.config.json` color_schemes + `font`/`layout`
- page type → template (`index.json`, `product.json`, or a new `page.<handle>.json`)
Output: a set of template JSONs + theme.config edits + a page/route manifest.

### 4 — Build (theme code)
- Write `templates/<…>.json` (compose sections, populate blocks). Reuse the catalog; only author a **new section** when no Bottle section fits.
- Apply global redesign settings to `theme.config.json`.
- Stage static assets under `public/`.
- Commit to `${GH_REPO}`.

### 5 — Deploy
- `sl theme push --theme ${SL_THEME_ID}` (or `--only` per file) — see [02](02-shopline-cli-reference.md).
- For each static page: create the **page record** via [`scripts/create-page.sh`](../scripts/create-page.sh) with the right `template_suffix` — see [05](05-pages-and-templates.md).
- Create products/collections/blog via their Admin API resources (same token).

### 6 — Validate
- Isolated Chrome + CDP loop ([06](06-deploy-publish-validate.md)): route renders, expected content present, screenshot.
- Optional visual diff against the source screenshot (1:1 mode).

### 7 — Publish & Report
- Publish via status swap when signed off ([06](06-deploy-publish-validate.md)); keep previous theme for rollback.
- Emit a report: pages built, sections used, unmapped/needs-review items, screenshots.

## Manifest (suggested artifact between phases)

A single JSON the agent threads through phases keeps Build/Deploy deterministic, e.g.:
```json
{
  "store": "${SL_STORE}", "themeId": "${SL_THEME_ID}", "mode": "1:1",
  "globals": { "color_schemes": { }, "font": { } },
  "templates": [ { "file": "templates/page.about-us.json", "from": "page.json" } ],
  "pages": [ { "title": "About Us", "handle": "about-us", "template_suffix": "about-us", "body_html": "…" } ],
  "products": [], "collections": [], "assets": []
}
```

## Open questions (to resolve before building the automation)

These shape the source side and the mapping engine — worth deciding explicitly:
1. **Source platforms in scope** (Shopify, WooCommerce, Wix, custom HTML…)? Each needs its own extractor.
2. **Commerce data**: migrate real products/collections/inventory, or content/pages only at first?
3. **1:1 fidelity bar**: pixel-close, or "same content, Bottle-native layout"? Defines the visual-diff gate.
4. **New sections allowed?** If a source block has no Bottle equivalent, do we author a custom section, or fall back to `custom-html`?
5. **Asset hosting**: re-upload media to SHOPLINE, or hotlink source CDNs?
6. **One store per migration or multi-tenant?** Affects token/secret management.
7. **Navigation/menus**: SHOPLINE menus are store data (Admin) — confirm the menu API and how nav maps.

> These are tracked here rather than answered; revisit with the source-side spec.
