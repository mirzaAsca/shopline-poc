# 05 — Pages & Templates: CLI vs Admin API

The single most important distinction for migration automation:

> **A template is theme code (CLI). A page is store data (Admin API).** Creating one does not create the other.

| | Template (`page.<suffix>.json`) | Page record (`/pages/<handle>`) |
|---|---|---|
| What | layout + content composition | the route + title + which template |
| Where | `templates/` in the theme | store database |
| Tool | `sl theme push` | Admin REST API (or admin UI) |
| Auth | theme-CLI session | **separate** Admin API token |
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

The theme CLI has **no page endpoint**. Two ways:

### A) Admin UI (manual, no token)
Admin → Online Store → Pages → *Add page* → set title → **Theme template: `about-us`** → Save. Then `/pages/about-us` renders.

### B) Admin REST API (terminal, automatable) ✅ preferred for the pipeline

> ⚠️ **Validation status:** the endpoint pattern + auth below are confirmed from SHOPLINE docs and a verified **sibling** endpoint (`store/blogs.json`), but the *pages* create call itself was **not executed during the POC** (the POC page was made in the admin UI). [`scripts/create-page.sh`](../../scripts/create-page.sh) is therefore **untested end-to-end** — verify the first real run. See [09-validation-status](../validation-status.md).

```
POST https://${SL_STORE}/admin/openapi/${SL_API_VERSION}/pages.json
Authorization: Bearer ${SL_TOKEN}
Content-Type: application/json; charset=utf-8

{ "page": { "title": "About Us",
            "body_html": "<p>Optional inline body</p>",
            "template_suffix": "about-us" } }
```
- `template_suffix` → links the page to `templates/page.<suffix>.json`. Empty/null → default `page.json`.
- `body_html` flows into the `main-page` section's body area.

Reusable helper (committed): [`scripts/create-page.sh`](../../scripts/create-page.sh)
```bash
export SL_TOKEN="…"                                  # one-time, see token setup below
./scripts/create-page.sh "About Us" about-us "<p>Body</p>"
./scripts/create-page.sh "FAQ" faq                   # body optional
```

### Getting an Admin API token (one-time, in admin)

SHOPLINE uses **direct token generation, not OAuth**:
1. (If needed) ask your SHOPLINE contact to enable the **API Auth** feature.
2. Admin → Settings → **Staff Settings** → create an admin staff member.
3. Open that staff → **API Auth** tab → **select the APIs** to authorize (include pages / `write_content`).
4. Optionally set expiry + IP allowlist → **Generate** → copy the token into `${SL_TOKEN}`.

After this one-time step, page creation is **100% terminal** — no admin UI per page.

## Migration implication

For each source page that becomes a standalone SHOPLINE page:
1. Build/choose a `page.<handle>.json` template (CLI push).
2. `create-page.sh "<Title>" <handle> "<body?>"` to mint the route.
3. Validate ([06](deploy-publish-validate.md)).

Products, collections, blog posts have their **own** Admin API resources (`products.json`, `collections`, blog endpoints) — same auth pattern, different endpoints.
