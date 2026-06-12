# Create custom pages (CMS) + attach templates

> Custom pages = `/pages/<handle>` (About, FAQ, …). One of the route types in [content-and-routes.md](content-and-routes.md). For **blogs/articles** see [create-blogs.md](create-blogs.md).

The single most important distinction for migration automation:

> **A template is theme code (CLI). A page is store data (created via SHOPLINE's internal admin API — there is NO public page API).** Creating one does not create the other.

| | Template (`page.<suffix>.json`) | Page record (`/pages/<handle>`) |
|---|---|---|
| What | layout + content composition | the route + title + which template |
| Where | `templates/` in the theme | store database |
| Tool | `sl theme push` | Admin **UI**, or its internal session-authed API (NO public API — see below) |
| Auth | theme-CLI session | admin **login session** (cookies) — **not** the OAuth app token |
| Without it | page renders with default `page.json` | **route 404s** even if the template exists |

## Step 1 — Create the template (CLI)

You can **start from an existing template** (copy & edit) or write fresh — sections are always reused from the catalog ([04](theme-architecture.md)).

```bash
cp templates/page.json templates/page.about-us.json   # start from the blank custom page
# …edit it…
```

### Worked example: an About Us template with injected content

`templates/page.about-us.json` — sections referenced by `type`; the `rich-text` section gets explicit blocks so real text shows immediately:

```json
{
  "sections": {
    "main-page": { "type": "main-page" },
    "about-rich-text": {
      "type": "rich-text",
      "settings": {},
      "blocks": {
        "about_heading": {
          "type": "heading",
          "settings": { "text": "About Us", "text_align": "center", "text_size": "title1" }
        },
        "about_body": {
          "type": "rich-text",
          "settings": { "content": "<p>Your about copy here.</p>" }
        }
      },
      "block_order": ["about_heading", "about_body"]
    },
    "about-image-with-text": { "type": "image-with-text" },
    "about-columns": { "type": "text-columns-with-image" }
  },
  "order": ["main-page", "about-rich-text", "about-image-with-text", "about-columns"]
}
```

Deploy it (additive, safe — does not affect existing pages):
```bash
sl theme push --theme ${SL_THEME_ID} --only templates/page.about-us.json
# verify it reached the store
sl theme pull --theme ${SL_THEME_ID} --only templates/page.about-us.json --path /tmp/verify
```

The naming convention `page.<suffix>.json` makes `<suffix>` (here `about-us`) appear:
- in the **theme editor's "Custom page ›" navigator**, and
- in **Admin → Pages → template picker**, and
- as the page's template **suffix** in Step 2. *(The internal page API attaches the template by full path — `templateName: "templates/page.<suffix>.json"` — there is no `template_suffix` field on the request; the suffix is just the `<suffix>` argument you pass to `create-page.mjs`.)*

## Step 2 — Create the page record

The theme CLI has **no page endpoint**, and ⚠️ **neither does SHOPLINE's public Admin API.**

> **Correction (verified 2026-06-12 on `mirza-asca` with a valid custom-app token):** there is **no `pages` resource** in SHOPLINE's public Admin API. Proof: probed ~25 REST paths (`/store/blogs.json` → 200, but every `pages`/`page`/`custom_pages` path → 404 / "script tag data not found"), and **introspected the full GraphQL Admin schema** at `/admin/graph/{ver}/graphql.json` — all **96 mutations**, with `productCreate`/`collectionCreate`/`scriptTagCreate`/`blog*` present but **zero page mutation** (the only `*Page*` types are pagination helpers like `PageInfo`). The earlier `POST .../pages.json` claim came from a bad web citation and is **disproven**. The old `scripts/create-page.sh` was deleted; use `scripts/create-page.mjs`.

So a page record can only be created two ways, **both using the admin login session (cookies), not the OAuth app token**:

### A) Admin UI (manual, reliable)
Admin → Online Store → Pages → *Add page* → set title → **Theme template: `<suffix>`** → Save. Then `/pages/<suffix>` renders. This is the **verified** path; only the page record needs it — the template (Step 1) is 100% CLI.

### B) Internal admin API — ✅ VERIFIED WORKING (the automated path)
Captured from the Admin UI on 2026-06-12 and confirmed by creating pages programmatically. Endpoint (session/cookie-authed, **not** the public OpenAPI):

```
POST https://${SL_STORE}/admin/api/site/page/customize
content-type: application/json     (auth = admin session cookies)

{ "name":        { "default": "About Us" },     // title
  "handle":      "about-us",
  "customizePath": "/pages/about-us",
  "templateName": "templates/page.about-us.json", // ← ATTACHES the theme template
  "templateType": 0,
  "status": 1,                                    // 1 = published
  "publishTime": <epoch ms>,
  "seo": { "title": "About Us", "desc": "", "handleList": ["about-us"] },
  "seoTitle": { "default": "About Us" }, "seoTitleV2": "About Us",
  "seoDesc": { "default": "" }, "seoKeyword": {}, "seoStatus": 1,
  "coverResourceId": "", "htmlConfig": "", "sourcePath": null, "customUrl": null, "sourceCustomPath": null }
```
Success → `{"code":"SUCCESS","data":{"id":"…","customizePath":"/pages/about-us"},"success":true}`.

- **`templateName`** is the attach mechanism: `templates/page.<suffix>.json` (default = `templates/page.json`). This is "create page + attach template" in one call.
- Page **content** comes from the attached template's sections (no `body_html` field needed) — exactly our template-driven model.

**Reusable script (committed):** [`scripts/create-page.mjs`](../../scripts/create-page.mjs). It runs the POST inside a **logged-in admin tab** in the isolated Chrome (so the browser supplies the session cookies):
```bash
# prereq: isolated Chrome on CDP port 9334 with the admin logged in (docs/ops/deploy-publish-validate.md)
node scripts/create-page.mjs "About Us" about-us about-us 9334   # title, handle, template-suffix, port
node scripts/create-page.mjs "FAQ" faq                           # default template
```

> ⚠️ Internal/undocumented endpoint — could change with SHOPLINE updates; keep the UI (A) as fallback. Auth is the admin **session**, not the app token. (Future: replay with the CLI's stored cookies+dfp-token to drop the browser dependency — same idea as the publish `changeThemeStatus` trick.)

## Migration implication

For each source page that becomes a standalone SHOPLINE page:
1. Build/push a `page.<handle>.json` template (CLI) — fully automated.
2. `node scripts/create-page.mjs "<Title>" <handle> <handle>` → mints the page record **and** attaches the template.
3. Validate ([06](deploy-publish-validate.md)).

What the **public Admin API DOES** support (verified — Bearer app token works): blogs (`/store/blogs.json`), products (`/products/products.json`), collections, script tags, customers, discounts (full list = the 96 GraphQL mutations). So blog posts/products/collections for a migration ARE API-creatable — only standalone **pages** are not.
