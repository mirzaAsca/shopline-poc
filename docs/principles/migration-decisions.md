# Migration Decisions — v1 (locked, AUTHORITATIVE)

> **Authority: principles.** Stakeholder-locked (interviews 2026-06). Where these differ from any runbook or older note, **these win**.

## Output & quality
- **Productized / modular ONLY.** Every piece of UI is a proper Bottle section (with `color_scheme`, `style.*` responsive controls, `presets`, i18n). **No `custom-html` fallback.** When a source block has no stock Bottle equivalent, **author a new custom section** (see [build-a-section](../runbooks/build-a-section.md)).
- **Brand-neutral names** for all structure (folders, files, schema IDs, block types, `t:` keys). Brand wording lives only in editable content. See [implementation-principles](implementation-principles.md).
- **Fidelity: pixel-close, desktop AND mobile** — achieved *via* the modular color-scheme + responsive-control systems ([../craft/color-schemes.md](../craft/color-schemes.md), [../craft/responsive-controls.md](../craft/responsive-controls.md)).

## Scope (v1)
- **Static pages + content only** — home, about, FAQ, contact, marketing, nav, footer, brand styling. **No commerce** (products/collections/cart) yet.
- **Source platforms:** Shopify, WooCommerce/WordPress, Wix/Squarespace, custom/static HTML — **one extractor per platform** (Wix/Squarespace need rendered-DOM scraping). *(Source-side extraction is a separate workstream, not specified here.)*
- **Assets:** pre-hosted on SHOPLINE under `public/images` (provided in the working theme). v1 does **not** scrape/re-upload media — reference those paths.
- **Localization:** carry over **all** source languages into `i18n/<locale>.json`.
- **SEO/URLs:** preserve handles + 301 redirects + meta (title/description/og).
- **Navigation:** recreate as SHOPLINE store menus (Admin) + wire the Bottle `header`. *(Menu API unconfirmed — see [validation-status](../validation-status.md).)*

## Operations
- **Tenancy:** one store per migration, isolated `.env`/token.
- **Publish:** **auto-publish always.** Targets are always *fresh* SHOPLINE stores (no live traffic), so publishing is safe; a human does **manual QA on the live link** afterward. The desktop+mobile visual gate runs as a **report**, not a hard blocker.
- **Precedence on conflict:** **split authority** — ops/CLI/deploy/page-records/validation → `../ops/*` wins; Sline craft (syntax, sections, color, responsive) → `../craft/*` wins.

## Superseded
These replace the earlier "pixel-close-fast / `custom-html` fallback / auto-publish-only-if-gate-passes" stance from the original blueprint. The build pipeline is in [../runbooks/migrate-a-page.md](../runbooks/migrate-a-page.md).
