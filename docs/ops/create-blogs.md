# Create blogs & articles (public Admin API) — ✅ VERIFIED

> Unlike custom pages, **blogs and articles ARE in SHOPLINE's public Admin REST API** — created with the Bearer **app token** (`SL_TOKEN`), no browser session needed. Verified 2026-06-12 on `mirza-asca`. Part of the mandatory route-parity step ([content-and-routes.md](content-and-routes.md)).

## Routes
- Blog index: `/blogs/<blog-handle>`
- Article: `/blogs/<blog-handle>/<article-handle>`

## 1. Create a blog (collection)
```
POST https://${SL_STORE}/admin/openapi/${SL_API_VERSION}/store/blogs.json
Authorization: Bearer ${SL_TOKEN}
Content-Type: application/json; charset=utf-8

{ "blog": { "title": "News", "handle": "news", "commentable": "moderate" } }
```
→ `200 {"blog":{"id":"6a2c2590…","handle":"news","title":"News","template_suffix":null,…}}`. Keep the `id`.

## 2. Create an article in that blog
```
POST .../store/blogs/{blogId}/articles.json
{ "blog": {                      ← ⚠️ the body is wrapped in "blog", NOT "article"
    "title": "Hello",
    "content_html": "<p>Body…</p>",
    "handle": "hello",
    "published": true,
    "author": "…",               // optional
    "image": null, "tags": []    // optional
} }
```
→ `200 {"blog":{"id":"…","title":"Hello","content_html":"…","handle":"hello",…}}`.
> Gotcha (verified): the article body uses the **`blog`** wrapper. `{"article":{…}}` or an unwrapped body return `500 "title not allow blank"`.

## Attaching a theme template
Both blog and article support **`template_suffix`** (theme template `templates/blog.<suffix>.json` / `templates/article.<suffix>.json`) — same idea as custom pages' `templateName`. Set it in the create body to attach a custom template.

## Reusable script (committed)
[`scripts/create-blog.mjs`](../../scripts/create-blog.mjs) (reads `.env`):
```bash
node scripts/create-blog.mjs blog "News" news
# → ✅ blog created: "News" id=6a2c2590…
node scripts/create-blog.mjs article 6a2c2590… "Hello" hello "<p>Body…</p>"
```

## Other public-API content (same auth, for completeness)
`productCreate`, `collectionCreate`, `scriptTagCreate`, customers, discounts — all in the public REST/GraphQL Admin API (see the 96 GraphQL mutations in [content-and-routes.md](content-and-routes.md)). Only **custom pages** fall outside it ([create-custom-pages.md](create-custom-pages.md)).
