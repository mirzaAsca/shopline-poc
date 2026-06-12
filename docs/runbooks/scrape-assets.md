# Runbook: Asset handling (provided-first, else scrape)

> Decision ([../principles/migration-decisions.md](../principles/migration-decisions.md)): **provided-first, else scrape → save into `public/images`**, reference via `asset_url()`.

## Rule
For every asset a page needs:
1. **Provided?** If it already exists under `public/images/…`, use it. Reference it in templates/sections with `` {{ `images/<file>` | asset_url() }} ``.
2. **Missing?** **Scrape it from the source**, save into `public/images/…`, then reference the same way.

## Scraping the source
- **Static/CDN URL:** download directly (e.g. `curl -L <asset-url> -o public/images/<file>`), preserving a sensible kebab-case name.
- **JS-rendered / background-image / responsive `srcset`:** use the **Chrome DevTools MCP** — load the page, read the computed `src`/`background-image`/`srcset`, then fetch the resolved URL. (Same browser tooling as [visual-qa.md](visual-qa.md).)
- **Fonts:** download into `public/fonts/`; load via a `components/.../fonts.html` partial with `@font-face` + `asset_url()` — never relative URLs in `.css` ([../craft/assets-and-fonts.md](../craft/assets-and-fonts.md)).

## In the spec
The Phase-1 plan records an **Assets register** (source URL · provided? · action · final `public/images/...` path). Each scrape is a checkbox item. Don't hotlink source CDNs — self-host so the migration survives the source changing.

## Naming
kebab-case, role-descriptive (`hero-banner.jpg`, not the source's hashed name). Keep the mapping in the spec's Assets register.
