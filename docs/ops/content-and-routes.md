# Content & routes — the route-parity hub

> **MANDATORY for a 1:1 migration:** the SHOPLINE store must reproduce **every route the source site has** — same paths, same content, nothing missing. This is a required phase of every migration spec ([../runbooks/migrate-a-page.md](../runbooks/migrate-a-page.md)), not an afterthought. This doc maps each route/content type to the verified way to create it.

## SHOPLINE route/content types

| Route type | URL pattern | Created by | Public API? | How / doc |
|---|---|---|---|---|
| **Home** | `/` | theme template `index.json` | n/a (theme) | `sl theme push` ([theme-architecture.md](theme-architecture.md)) |
| **Custom page** (CMS: About, FAQ…) | `/pages/<handle>` | **internal** admin API + theme template | ❌ no public API | [create-custom-pages.md](create-custom-pages.md) — `scripts/create-page.mjs` |
| **Blog** | `/blogs/<handle>` | public REST `store/blogs.json` | ✅ Bearer token | [create-blogs.md](create-blogs.md) — `scripts/create-blog.mjs` |
| **Article** | `/blogs/<blog>/<article>` | public REST `store/blogs/{id}/articles.json` | ✅ Bearer token | [create-blogs.md](create-blogs.md) |
| **Product** | `/products/<handle>` | public REST/GraphQL `productCreate` | ✅ Bearer token | (commerce — deferred in v1 scope) |
| **Collection** | `/collections/<handle>` | public REST/GraphQL `collectionCreate` | ✅ Bearer token | (commerce — deferred in v1 scope) |
| **Theme-predefined types** (cart, search, 404, password, customer/account) | `/cart`, `/search`, … | theme templates only (auto-route) | n/a (theme) | exist once the template is pushed |
| **Navigation / menus** | header/footer links | store data (menu) | ⚠️ unconfirmed | needs the menu API (see [validation-status.md](../validation-status.md)) |
| **URL redirects** (old→new path, SEO) | 301s | store data | ⚠️ unconfirmed | needs the redirects API |

## The rule
- **Theme-predefined types** (home, product, collection, cart, search, 404, customer pages) get their routes automatically once the matching **template** exists in the theme and the underlying **data** (product/collection) exists. You author/migrate the *template* (CLI); the *route* follows the data.
- **Custom pages, blogs, articles** are **store records** you must create explicitly — each is a route the source has and the migration must reproduce. Use the dedicated creators above.
- **Every source route → one SHOPLINE route.** Build the inventory in the spec (Phase 1) and tick each off as created (Phase 2).

## Two creation auth models (don't mix them up)
- **Public Admin API** (blogs, articles, products, collections, …): `Authorization: Bearer ${SL_TOKEN}` → `…/admin/openapi/{ver}/…`. Verified working.
- **Custom pages**: NO public API — the **internal** admin API `…/admin/api/site/page/customize`, authed by the **admin browser session** (cookies), driven via CDP. See [create-custom-pages.md](create-custom-pages.md).

## Migration checklist (per source route)
- [ ] Classify the source route (page / blog / article / product / collection / theme-type).
- [ ] Author/choose the theme template if needed (CLI).
- [ ] Create the store record (page / blog / article / …) with the matching handle so the URL matches the source.
- [ ] Attach the template (`templateName` for pages, `template_suffix` for blogs/articles).
- [ ] Validate the route renders + matches the source ([../runbooks/visual-qa.md](../runbooks/visual-qa.md)).
