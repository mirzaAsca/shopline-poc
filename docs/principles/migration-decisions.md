# Migration Decisions (v1, locked) — AUTHORITATIVE
> Authority: principles • STATUS: STUB (decisions final; prose to write)
**Supersedes** the old `docs/07-migration-blueprint.md` where they differ.
## Locked decisions
- Output = productized/modular ONLY (no custom-html fallback → author custom sections).
- Names = always brand-neutral.
- Fidelity = pixel-close, desktop AND mobile.
- Publish = auto-publish always (fresh stores, no live traffic) + manual QA on live link.
- Platforms = Shopify, WooCommerce/WordPress, Wix/Squarespace, custom HTML (per-platform extractors).
- Scope v1 = static pages + content only (no commerce).
- Assets = pre-hosted in public/images (provided).
- Navigation = recreate as SHOPLINE store menus + Bottle header.
- Tenancy = one store per migration.
- SEO = preserve handles + 301s + meta. i18n = carry all source languages.
- Precedence = split authority (ops→docs/ops, craft→docs/craft).
