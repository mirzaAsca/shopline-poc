> ⚠️ **Authority note:** [../principles/migration-decisions.md](../principles/migration-decisions.md) is the source of truth for v1 policy. Where this blueprint mentions a `custom-html` fallback or "auto-publish only if the gate passes," the **locked decisions override**: output is **modular-only** (author a custom section instead) and publishing is **always-auto** to fresh stores with manual live QA. The phase pipeline below still applies.

# 07 — Migration Blueprint (target side)

Pipeline for **any platform → SHOPLINE (Bottle)** migration. The **source-scraping side is a separate workstream**; this doc locks the v1 decisions and shows where scraping plugs into the verified SHOPLINE/Bottle target side (docs 01–06).

> 🔴 **MANDATORY phase — route parity.** A 1:1 migration must reproduce **every route** the source has (same paths/handles), not just visuals. Build the full route inventory in the spec and create each store record — custom pages, blogs, articles, products/collections — per [../ops/content-and-routes.md](../ops/content-and-routes.md). Pages use the internal API ([../ops/create-custom-pages.md](../ops/create-custom-pages.md)); blogs/articles use the public API ([../ops/create-blogs.md](../ops/create-blogs.md)). A missing route = an incomplete migration.

## Modes

- **1:1** — reproduce the source UI/UX as faithfully as possible. **v1 target = pixel-close** (desktop *and* mobile).
- **Redesign** — keep source content/IA, apply a fresh Bottle-native design via `theme.config.json` color schemes + `font`/`layout`. (Later phase.)

## v1 decisions (locked via stakeholder interview, 2026-06)

| Area | Decision | Implication |
|---|---|---|
| **Source platforms** | Shopify, WooCommerce/WordPress, Wix/Squarespace/SaaS builders, custom/static HTML | A **per-platform extractor** each; Wix/Squarespace need rendered-DOM scraping |
| **Scope** | Static **pages + content** only (home, about, FAQ, contact, marketing, nav, footer, brand styling) | **No commerce** (products/collections/cart) in v1 |
| **Fidelity** | **Pixel-close** 1:1 | High bar; pushes toward per-block custom markup |
| **Unmapped UI** | **custom-html fallback** — adapted source HTML+CSS into `custom-html` sections | Fast & visually faithful, but fragile on mobile/responsive (see Risks) |
| **Assets** | **Pre-hosted on SHOPLINE under `public/images`** (provided in the working theme folder) | v1 does **not** scrape/re-upload media; it references existing `public/images` paths |
| **Navigation** | Recreate as **SHOPLINE store menus (Admin)** + wire Bottle `header` | Needs the menu Admin API confirmed (see [Needs-research](#needs-research-not-user-decisions)) |
| **Tenancy** | **One store per migration**, isolated `.env`/token | Simple secret model; no multi-tenant store yet |
| **Go-live** | **Auto-publish when the validation gate passes** | The gate is the *only* safety net → must be strict |
| **Validation gate** | **Visual diff vs source (under threshold) + all pages render (no 404) + no broken assets/links**, at **desktop AND mobile** | Catches the custom-html mobile-break risk |
| **SEO / URLs** | **Preserve handles + 301 redirects + meta** (title/description/og) | Protects existing ranking; needs the redirects Admin API |
| **Localization** | **Carry over all source languages** into Bottle `i18n/<locale>.json` | Multiplies extraction + mapping per locale |

## Pipeline phases

```
[0 Intake] → [1 Scan*] → [2 Extract*] → [3 Map] → [4 Build] → [5 Deploy] → [6 Validate] → [7 Auto-publish]
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
- No clean match → **`custom-html` section** holding adapted markup+CSS (v1 policy).
- Page type → template (`index.json`, or a new `page.<handle>.json`).
- Brand tokens → `theme.config.json` color_schemes + `font`/`layout` (more so in redesign mode).
- Nav tree → store-menu manifest. SEO → handle + redirect + meta manifest. Locales → i18n manifest.
Output: the **manifest** below.

### 4 — Build (theme code)
- Write `templates/<…>.json` (compose sections; fill block settings; embed `custom-html` for unmapped blocks).
- Reference assets via the provided `public/images` paths.
- Populate `i18n/<locale>.json` for every source locale.
- Commit to `${GH_REPO}`.

### 5 — Deploy
- `sl theme push --theme ${SL_THEME_ID}` (or `--only` per file) — [02](../ops/cli-reference.md).
- Per static page: [`scripts/create-page.sh`](../../scripts/create-page.sh) with `template_suffix` + handle + meta — [05](../ops/create-custom-pages.md).
- Create **menus** and **URL redirects** via Admin API (endpoints to confirm).

### 6 — Validate (the gate)
Isolated Chrome + CDP ([06](../ops/deploy-publish-validate.md)), at **desktop + mobile** breakpoints:
- every route returns 200 / renders (no "404 page not found"),
- no broken images/links/missing assets,
- **visual diff** vs the captured source screenshot under threshold.
All must pass to proceed.

### 7 — Auto-publish & report
- If the gate passes → publish via **status swap** ([06](../ops/deploy-publish-validate.md)); record the prior live theme id for rollback.
- Emit a report: pages built, sections vs custom-html used, locales, redirects set, visual-diff scores, screenshots, and any human-review flags.

## Manifest (artifact threaded across phases)

```json
{
  "store": "${SL_STORE}", "themeId": "${SL_THEME_ID}", "mode": "1:1-pixel-close",
  "locales": ["en", "de", "..."],
  "globals": { "color_schemes": { }, "font": { }, "layout": { } },
  "templates": [ { "file": "templates/page.about-us.json", "from": "page.json",
                   "sections": [ { "type": "image-banner" }, { "type": "custom-html", "note": "pricing table" } ] } ],
  "pages":     [ { "title": "About", "handle": "about-us", "template_suffix": "about-us",
                   "meta": { "title": "...", "description": "...", "og": "..." } } ],
  "menus":     [ { "handle": "main-menu", "items": [ ] } ],
  "redirects": [ { "from": "/old-path", "to": "/about-us" } ],
  "assets":    [ "public/images/hero.jpg" ],
  "validation":{ "desktop": { }, "mobile": { } }
}
```

## Risks & flags (consequences of the v1 choices)

1. **custom-html + auto-publish + pixel-close is the risk hot-spot.** custom-html can pass a desktop screenshot diff yet break mobile layout and not be merchant-editable. **Mitigation:** the dual-breakpoint visual gate is mandatory; flag custom-html-heavy pages for optional human review even when the gate passes.
2. **Wix/Squarespace** are JS-rendered/obfuscated → extraction is the hardest; budget for headless rendering + heuristic decomposition.
3. **"Carry all languages"** multiplies extraction/build/validation per locale — scope each migration's locale count explicitly.
4. **Auto-publish** means the validation gate quality *is* the product safety. Invest there first.

## Needs-research (not user decisions)

Confirm these SHOPLINE capabilities before building the corresponding step:
- **Menus/navigation Admin API** — create/update store menus (for the nav decision).
- **URL redirects Admin API** — create 301s (for SEO decision).
- **`public/images` reference convention** in Sline (how templates resolve them — likely `asset_url()`); confirm against the provided assets.
- **Visual-diff tooling** choice (e.g. pixelmatch over CDP screenshots) and the per-breakpoint threshold.
- **i18n authoring** — exact `i18n/<locale>.json` key structure expected by Bottle sections.

See [09-validation-status](../validation-status.md) for what is proven vs. still unverified.
