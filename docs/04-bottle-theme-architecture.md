# 04 — Bottle Theme Architecture & Content Model

This is the **target model** an automated migration composes into. Understand it well: migration = mapping scraped source content onto Bottle's **templates → sections → blocks**.

Theme metadata (from `theme.schema.json`): `theme_name: Bottle`, `theme_type_version: OS_3.0`, `theme_author: SHOPLINE`, docs: <https://themes.shopline.com/themes/Bottle/styles/Default>.

## Template engine: Sline (Handlebars-like) — NOT Liquid

Bottle is an **Online Store 3.0** theme using SHOPLINE's **Sline** engine (<https://sline.dev>). If you know Shopify, the *structure* (templates/sections/blocks, JSON templates, settings schema) is analogous, but the **syntax is Handlebars-style, not Liquid**:

| Concept | Bottle / Sline | Shopify / Liquid |
|---|---|---|
| File type | `.html` (+ `.json` templates) | `.liquid` |
| Output | `{{ block.settings.text }}` | `{{ block.settings.text }}` |
| Section schema | `{{#schema}} … {{/schema}}` block inside the `.html` | `{% schema %}` |
| Render a section group | `{{#sections "header-group" /}}` | `{% sections 'header-group' %}` |
| Render a component/partial | `{{#component "stylesheet" src=… /}}` | `{% render %}` |
| Render block area | `{{#content "blocks" /}}` | `{% content_for 'blocks' %}` |
| Settings classes | `{{ block.settings \| class_list() }}` | filters |
| Global config file | `theme.schema.json` + `theme.config.json` | `config/settings_schema.json` + `settings_data.json` |

There is **no `config/` directory** and no `settings_schema.json`. Tools expecting those are legacy ([08](08-troubleshooting.md)).

## Directory structure

```
layout/        # top-level page shells (theme.html is the main one)
templates/     # one JSON (or .html) per page type — composes sections
sections/      # reusable, schema-driven UI blocks (the big building units)
blocks/        # smaller schema-driven units used *inside* sections
components/    # partials/helpers (icons, media, stylesheet, meta-tags…)
i18n/          # translations: <locale>.json (storefront) + <locale>.schema.json (editor labels)
public/        # static assets (css/js/images), organized by area
theme.schema.json   # global theme settings definition (colors, fonts, cards, …)
theme.config.json   # active preset values for those settings (the "Default" preset)
```

### `layout/theme.html` (the shell)

Loads base CSS/JS, renders `{{#sections "header-group" /}}` and `{{#sections "footer-group" /}}` around `{{#content "layout" /}}` (the page body). Other layouts: `password.html`, `gift_card.html`, `proofing.html`.

## Templates catalog (`templates/`)

A template is a JSON file naming the sections (and their order) for a page type. **The file name is the routing/assignment key.**

| Template | Page type | Notes |
|---|---|---|
| `index.json` | Home page | composed of content sections |
| `page.json` | **generic Custom page** | minimal: just `main-page`. Copy this to start a new page template |
| `page.contact.json` | Contact page variant | `main-page` + `contact-form`. Example of a **suffix variant** |
| `page.order_tracking.json` | Order tracking | |
| `product.json` | Product detail | |
| `collection.json` | Collection | |
| `collections_all.json` | All collections list | |
| `blog.json` | Blog index | |
| `article.json` | Blog post | |
| `search.json` | Search results | |
| `cart.json` | Cart | |
| `404.json` | Not found | |
| `password.json` | Password gate | |
| `gift_card.html` / `policy.html` / `proofing.html` | system pages (raw html) | |
| `customers/*.json` | account, login, register, orders, order, addresses, company, activate_account, forgot_password | account area |

**Suffix variants → the migration lever.** A file named `page.<suffix>.json` becomes a selectable template called `<suffix>`. e.g. `page.about-us.json` → assignable to a page via `template_suffix: "about-us"`. This is how you create per-page custom layouts. See [05](05-pages-and-templates.md).

### Template JSON shape

```json
{
  "sections": {
    "<instance-id>": { "type": "<section-type>", "settings": { }, "blocks": { } }
  },
  "order": ["<instance-id>", "…"]
}
```
- `type` = a section name from `sections/`.
- Sections referenced with only `{ "type": … }` render from their **preset defaults** (good enough to show content immediately).
- To inject explicit content, populate `settings` and nested `blocks` (each block has `type`, `settings`, and `block_order`). See the worked example in [05](05-pages-and-templates.md).

## Sections catalog (`sections/`)

The primary building units. Grouped by role:

**Global / layout**
`header`, `footer`, `announcement-bar`, `header-group.json`, `footer-group.json`, `main-password-header`, `main-password-footer`

**Content (page-building — the migration workhorses)**
`rich-text`, `image-with-text`, `text-columns-with-image`, `image-banner`, `slideshow`, `video`, `faq`, `collection-list`, `featured-collection`, `featured-product`, `recommended-product`, `sign-up-and-save`, `custom-html`, `custom-section`, `custom-page`, `contact-form`, `apps`, `blog`

**Page "main" sections (bound to a page type's data)**
`main-page`, `main-product`, `main-collection-cover`, `main-collection-products`, `main-collections-all`, `main-article`, `main-blog`, `main-search`, `main-not-found`, `main-order-tracking`, `main-password`, `main-cart-items`, `main-cart-footer`

**Commerce / cart**
`cart-drawer`, `cart-bubble`, `cart-notification`, `cart-notification-product`, `predictive-search`

**Customer / account**
`customers-account`, `customers-login`, `customers-register`, `customers-addresses`, `customers-company`, `customers-forgot-password`, `customers-activate-account`, `customers-order-list`, `customers-order-detail`

> A section is an `.html` file (or a folder `sections/<name>/<name>.html` + its css/js/blocks) containing markup plus a `{{#schema}}` block declaring `settings`, allowed `blocks`, and `presets`.

## Blocks catalog (`blocks/`)

Smaller units placed inside sections (and themselves schema-driven):
`heading`, `subheading`, `description`, `rich-text`, `button`, `button-group`, `heading-with-link`, `image`, `group`, `custom-html`, `article`, `collection`, `product`, `product-list`.

Common content-bearing settings (useful for migration injection):
- `heading` block → `settings.text` (+ `text_size`, `text_align`)
- `rich-text` block → `settings.content` (HTML/richtext)
- `button` block → `settings.text`, link settings
- `image` block → image/src settings

## Components (`components/`)

Reusable partials/helpers (not directly placed by merchants): `icons`, `media`, `image.html`, `breadcrumb`, `pagination`, `facets`, `cart`, `product`, `customers`, `input`, `share-button`, `social-medias.html`, `meta-tags.html`, `page-head.html`, `stylesheet.html`, `script.html`, `theme-css-var.html`, `tips-card`.

## Global theme settings (`theme.schema.json` → `theme.config.json`)

`theme.schema.json` defines global setting groups; `theme.config.json` holds the active **preset** values (`current: "Default"`). These drive the whole look — the redesign knobs.

Setting groups (with approx. # of settings):
`component_color` (14), `font` (11), `layout` (6), `button` (9), `sku` (9), `input` (9), `product_card` (18), `collection_card` (11), `blog_card` (11), `other_card` (9), `dropdown_menu` (9), `drawer` (8), `cart` (2), `media_sosial` (32), `favicon` (1).

**Color schemes** live under `theme.config.json → presets.Default.theme.color_schemes` (`scheme-1`…`scheme-4`), each defining `color_background`, `color_text`, `color_button_*`, `color_card_background`, etc. Sections reference a scheme via a `color_scheme` setting. → For a **redesign**, edit these schemes + `font`/`layout` groups; for **1:1**, derive scheme colors from the scraped source palette.

## How a page renders (mental model)

```
layout/theme.html
  └─ header-group  →  sections (header, announcement-bar)
  └─ content/layout →  templates/<page>.json
                          └─ section instances (in `order`)
                                └─ blocks (in block_order)
                                      └─ settings (text/img/links)  ← migration injects here
  └─ footer-group  →  sections (footer)
global look ← theme.schema.json/theme.config.json (colors, fonts, cards)
```

## Migration mapping cheat-sheet (source → Bottle)

| Source element | Bottle target |
|---|---|
| Hero / banner | `image-banner` or `slideshow` section |
| Rich text / about copy | `rich-text` section (heading + rich-text blocks) |
| Feature columns / icon grid | `text-columns-with-image` |
| Image + text split | `image-with-text` |
| FAQ / accordion | `faq` |
| Product grid / featured | `featured-collection` / `featured-product` / `collection-list` |
| Newsletter signup | `sign-up-and-save` |
| Embedded video | `video` |
| Arbitrary HTML/widget | `custom-html` / `custom-section` |
| Static page (About, Terms…) | `page.<suffix>.json` template + page record ([05](05-pages-and-templates.md)) |
| Nav menu | header menu (store navigation data, Admin) + `header` section |
| Footer columns / social | `footer` section + `media_sosial` global settings |
| Brand colors / fonts | `theme.config.json` color_schemes + `font` group |

See [07-migration-blueprint](07-migration-blueprint.md) for how the agent walks source → these targets.
