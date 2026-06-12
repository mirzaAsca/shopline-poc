# SHOPLINE official references (docs-first rule)

> **Rule:** when learning a SHOPLINE behavior or debugging a SHOPLINE issue, **consult the official docs FIRST** — do not brute-force/guess endpoints or APIs. Find the documented method, link it, and when you resolve something, **record the doc link in `LEARNINGS.md`** next to the finding. Reverse-engineering (capture/replay, schema introspection) is a *last resort* only when something is genuinely undocumented (e.g. SHOPLINE's internal page API).

## Primary docs
- **Developer platform (hub):** https://developer.shopline.com/
- **Online Store 3.0 themes + CLI (Bottle/Sline):** https://developer.shopline.com/docs/online-store-3-0-themes/
  - CLI overview / theme commands: https://developer.shopline.com/docs/online-store-3-0-themes/development-tools/cli/overview/
- **Sline template engine:** https://sline.dev/
- **Admin REST API:** https://developer.shopline.com/docs/admin-rest-api/
  - Online Store resources (blogs, articles, script tags…): https://developer.shopline.com/docs/admin-rest-api/online-store/
- **GraphQL Admin API:** https://developer.shopline.com/docs/apps/api-instructions-for-use/graph-ql-admin-api/overview/
  - **API Explorer (live schema):** https://developer.shopline.com/graphql/admin
- **Open API hub (tokens / getting started):** https://open-api.docs.shoplineapp.com/
  - Access tokens: https://open-api.docs.shoplineapp.com/docs/getting-started
- **API versioning:** https://developer.shopline.com/docs/apps/api-instructions-for-use/api-versioning-guide/
- **Merchant Help Center (UI behavior):** https://help.shopline.com/

## When to use which
| Question | Look here first |
|---|---|
| Theme files, CLI, Sline syntax | OS 3.0 themes docs + sline.dev |
| Create/query products, collections, blogs, articles, script tags | Admin REST API → Online Store; or GraphQL API Explorer |
| What mutations/queries exist | GraphQL **API Explorer** (authoritative live schema) |
| Tokens / scopes / auth | Open API hub getting-started |
| Merchant-facing UI flow (no public API, e.g. custom pages, menus) | Help Center — then the internal API only if undocumented |

## Verified gaps (documented here so we don't re-discover)
- **Custom pages have NO public API** (REST + GraphQL introspected) — created via the Admin UI / internal `…/site/page/customize` ([create-custom-pages.md](create-custom-pages.md)). No official API doc exists for it.
- **Menus / URL redirects** — public API unconfirmed; check the Admin REST API "Online Store" section before building.
