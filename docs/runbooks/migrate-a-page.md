# Migration Runbook

Pipeline for **any platform → SHOPLINE (Bottle)** migration. The **source-scraping side is a separate workstream**; this doc locks the v1 decisions and shows where scraping plugs into the verified SHOPLINE/Bottle target side (docs 01–06).

Authority: [../principles/migration-decisions.md](../principles/migration-decisions.md). Output is **modular-only**: use stock Bottle sections where they fit, otherwise author a reusable custom section. Do not use `custom-html` as a migration fallback.

> **Mandatory route parity:** a 1:1 migration must reproduce **every route** the source has (same paths/handles), not just visuals. Build the full route inventory in the spec and create each store record — custom pages, blogs, articles, products/collections — per [../ops/content-and-routes.md](../ops/content-and-routes.md). Pages use the internal API ([../ops/create-custom-pages.md](../ops/create-custom-pages.md)); blogs/articles use the public API ([../ops/create-blogs.md](../ops/create-blogs.md)). A missing route = an incomplete migration.

## Modes

- **1:1** — reproduce the source UI/UX as faithfully as possible. **v1 target = pixel-close** (desktop *and* mobile).
- **Redesign** — keep source content/IA, apply a fresh Bottle-native design via `theme.config.json` color schemes + `font`/`layout`. (Later phase.)

## v1 decisions (locked via stakeholder interview, 2026-06)

| Area | Decision | Implication |
|---|---|---|
| **Source platforms** | Shopify, WooCommerce/WordPress, Wix/Squarespace/SaaS builders, custom/static HTML | A **per-platform extractor** each; Wix/Squarespace need rendered-DOM scraping |
| **Scope** | Static **pages + content** only (home, about, FAQ, contact, marketing, nav, footer, brand styling) | **No commerce** (products/collections/cart) in v1 |
| **Fidelity** | **Pixel-close** 1:1, desktop and mobile | Achieved through reusable sections, color schemes, and responsive controls |
| **Unmapped UI** | Author a **new modular custom section** | No `custom-html` fallback; keep merchant-editable schema, presets, i18n, color, responsive controls |
| **Assets** | **Provided-first, else scrape** into `public/images` | Reference bundled assets via `asset_url()`; do not hotlink source CDNs |
| **Navigation** | Recreate as **SHOPLINE store menus (Admin)** + wire Bottle `header` | Needs the menu Admin API confirmed (see [Needs-research](#needs-research-not-user-decisions)) |
| **Tenancy** | **One store per migration**, isolated `.env`/token | Simple secret model; no multi-tenant store yet |
| **Go-live** | **Auto-publish always** to the fresh target store | Manual live QA happens afterward on the live link |
| **Validation report** | **Visual diff vs source + all pages render (no 404) + no broken assets/links**, at **desktop AND mobile** | It is the report humans use for final QA, not a reason to keep a fresh store unpublished |
| **SEO / URLs** | **Preserve handles + 301 redirects + meta** (title/description/og) | Protects existing ranking; needs the redirects Admin API |
| **Localization** | **Carry over all source languages** into Bottle `i18n/<locale>.json` | Multiplies extraction + mapping per locale |

## Pipeline phases

```
[0 Intake] -> [1 Scan*] -> [2 Extract*] -> [3 Map] -> [4 Build] -> [5 Deploy + records] -> [6 Publish] -> [7 Validate + report]
                  └──────── * per-platform source side, out of scope here ────────┘
```

### 0 — Intake
Inputs: source URL, mode (default 1:1 pixel-close), target `${SL_STORE}` + a clean Bottle `${SL_THEME_ID}`, `${SL_TOKEN}`, `.env`. Confirm `sl theme list` auth + token validity.

### 1 — Scan *(source side — out of scope here)*
Crawl source → navigation tree, page inventory, page-type classification (home/static/contact/blog…), **all locales**, asset references. Wix/Squarespace: use a rendered headless browser.

### 2 — Extract *(source side — out of scope here)*
Per page per locale: structured content (headings, copy, images→`public/images` refs, links), section decomposition, **computed styles** (needed for pixel-close), brand tokens (palette, type, spacing), SEO meta + source URL/handle.

### 3 — Map (source → Bottle)
Per the [§ cheat-sheet](../ops/theme-architecture.md#migration-mapping-cheat-sheet-source--bottle):
- Clean match → stock Bottle **section** + block settings.
- No clean match → **new reusable custom section** with schema, presets, i18n, `color_scheme`, and responsive `style.*` controls.
- Page type → template (`index.json`, or a new `page.<handle>.json`).
- Brand tokens → `theme.config.json` color_schemes + `font`/`layout` (more so in redesign mode).
- Nav tree → store-menu manifest. SEO → handle + redirect + meta manifest. Locales → i18n manifest.
Output: the **manifest** below.

### 4 — Build (theme code)
- Write or reuse modular sections. New custom sections follow [build-a-section.md](build-a-section.md).
- Write `templates/<...>.json` (compose sections; fill settings and block instances with migrated content).
- Reference provided/scraped assets via `public/images` paths and `asset_url()`.
- Populate `i18n/<locale>.json` for every source locale.
- Commit to `${GH_REPO}`.

### 5 — Deploy + create route records
- `sl theme push --theme ${SL_THEME_ID}` (or `--only` per file) — [02](../ops/cli-reference.md).
- Per static page: `node scripts/create-page.mjs "<Title>" <handle> <template-suffix>` — [05](../ops/create-custom-pages.md). This uses the internal session-authed admin API and attaches `templates/page.<suffix>.json` via `templateName`.
- Per blog/article: `node scripts/create-blog.mjs ...` — [create-blogs.md](../ops/create-blogs.md).
- Create **menus** and **URL redirects** via verified Admin UI/API flow. Their public APIs are still unconfirmed; check [validation-status.md](../validation-status.md) before unattended automation.

### 6 — Publish
Publish the target theme via the verified status-swap API ([06](../ops/deploy-publish-validate.md)). Targets are fresh stores, so v1 policy is publish-then-manual-live-QA. Record the prior live theme id for rollback.

### 7 — Validate + report
Isolated Chrome + CDP ([06](../ops/deploy-publish-validate.md)), at **desktop + mobile** breakpoints:
- every route returns 200 / renders (no "404 page not found"),
- no broken images/links/missing assets,
- **visual diff** vs the captured source screenshot under threshold,
- agent review of merged original|new images confirms identity.
Emit a report: pages built, sections/custom sections used, locales, redirects set, visual-diff scores, screenshots, and any human-review flags.

## Manifest (artifact threaded across phases)

```json
{
  "store": "${SL_STORE}", "themeId": "${SL_THEME_ID}", "mode": "1:1-pixel-close",
  "locales": ["en", "de", "..."],
  "globals": { "color_schemes": { }, "font": { }, "layout": { } },
  "templates": [ { "file": "templates/page.about-us.json", "from": "page.json",
                   "sections": [ { "type": "image-banner" }, { "type": "pricing-table", "note": "custom modular section" } ] } ],
  "pages":     [ { "title": "About", "handle": "about-us", "templateName": "templates/page.about-us.json",
                   "meta": { "title": "...", "description": "...", "og": "..." } } ],
  "menus":     [ { "handle": "main-menu", "items": [ ] } ],
  "redirects": [ { "from": "/old-path", "to": "/about-us" } ],
  "assets":    [ "public/images/hero.jpg" ],
  "validation":{ "desktop": { }, "mobile": { } }
}
```

## Risks & flags

1. **Custom sections can drift into one-off code.** Mitigation: enforce brand-neutral names, schema settings, presets, i18n, color schemes, and responsive controls in every task.
2. **Wix/Squarespace** are JS-rendered/obfuscated → extraction is the hardest; budget for headless rendering + heuristic decomposition.
3. **"Carry all languages"** multiplies extraction/build/validation per locale — scope each migration's locale count explicitly.
4. **Auto-publish** targets fresh stores, but the live QA report must be complete because humans rely on it for final approval.

## Needs-research (not user decisions)

Confirm these SHOPLINE capabilities before building the corresponding step:
- **Menus/navigation Admin API** — create/update store menus (for the nav decision).
- **URL redirects Admin API** — create 301s (for SEO decision).
- **`public/images` reference convention** in Sline (how templates resolve them — likely `asset_url()`); confirm against the provided assets.
- **Visual-diff tooling** choice (e.g. pixelmatch over CDP screenshots) and the per-breakpoint threshold.
- **i18n authoring** — exact `i18n/<locale>.json` key structure expected by Bottle sections.

See [09-validation-status](../validation-status.md) for what is proven vs. still unverified.
