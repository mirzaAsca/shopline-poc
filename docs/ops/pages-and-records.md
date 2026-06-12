# 05 — Pages & Templates: CLI vs Admin API

The single most important distinction for migration automation:

> **A template is theme code (CLI). A page is store data (Admin API).** Creating one does not create the other.

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
- as the `template_suffix` value for the Admin API (Step 2).

## Step 2 — Create the page record

The theme CLI has **no page endpoint**, and ⚠️ **neither does SHOPLINE's public Admin API.**

> **❌ CORRECTION (verified 2026-06-12 on `mirza-asca` with a valid custom-app token):** there is **no `pages` resource** in SHOPLINE's public Admin API. Proof: probed ~25 REST paths (`/store/blogs.json` → 200, but every `pages`/`page`/`custom_pages` path → 404 / "script tag data not found"), and **introspected the full GraphQL Admin schema** at `/admin/graph/{ver}/graphql.json` — all **96 mutations**, with `productCreate`/`collectionCreate`/`scriptTagCreate`/`blog*` present but **zero page mutation** (the only `*Page*` types are pagination helpers like `PageInfo`). The earlier `POST …/pages.json` claim came from a bad web citation and is **disproven**. `scripts/create-page.sh` does **not** work — see its deprecation header.

So a page record can only be created two ways, **both using the admin login session (cookies), not the OAuth app token**:

### A) Admin UI (manual, reliable)
Admin → Online Store → Pages → *Add page* → set title → **Theme template: `<suffix>`** → Save. Then `/pages/<suffix>` renders. This is the **verified** path; only the page record needs it — the template (Step 1) is 100% CLI.

### B) Automate the internal admin API via CDP (capture-and-replay)
The Admin UI's "Add page" form POSTs to SHOPLINE's **internal** admin API (session/cookie-authed). To automate page creation without clicking:
1. Log into the admin in the isolated Chrome ([deploy-publish-validate.md](deploy-publish-validate.md) — same CDP setup).
2. With CDP network capture on, add a page once (or watch the request) → capture the exact internal endpoint + payload + cookies.
3. Replay that request in a script for subsequent pages (same pattern as the publish `changeThemeStatus` trick — using a session you already hold, not a public API).

> This is the only automatable route. It depends on an admin session and an internal endpoint that is **undocumented and may change** — treat as ⚠️ and keep a UI fallback. (Runbook/script: TODO once captured.)

## Migration implication

For each source page that becomes a standalone SHOPLINE page:
1. Build/choose a `page.<handle>.json` template (CLI push) — fully automated.
2. Mint the page record + attach the template (`template_suffix = <handle>`) via **A** (UI) or **B** (captured internal API).
3. Validate ([06](deploy-publish-validate.md)).

What the **public Admin API DOES** support (verified — Bearer app token works): blogs (`/store/blogs.json`), products (`/products/products.json`), collections, script tags, customers, discounts (full list = the 96 GraphQL mutations). So blog posts/products/collections for a migration ARE API-creatable — only standalone **pages** are not.
