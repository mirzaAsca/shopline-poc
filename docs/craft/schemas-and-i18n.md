# Craft: Schemas & i18n
> **Authority: craft.** **Trust: ⚠️ inherited** for patterns; ✅ the setting-type vocabulary below is verified from this repo.
> NOTE: the **verified, extracted-from-this-theme setting-type vocabulary** lives in `../ops/theme-architecture.md` (single source of truth) — prefer it over §7.3's generic list.

## 7. Schemas and i18n

Schemas live in `{{#schema}} ... {{/schema}}` at the bottom of section/block HTML. JSON only.

### 7.1 Required patterns

- `"name": "t:sections.my_section.name"` → define in `i18n/en.schema.json`
- **`presets`** array so the section appears in the customizer
- Generic default strings in presets, not brand copy

### 7.2 Image settings

| Platform | Type |
|----------|------|
| Shopify | `image_picker` |
| Shopline | **`image`** |

`section.settings.my_image` is an **object**, not a URL. Resolve with `image_url()`:

```handlebars
{{#var img_url /}}
{{#if section.settings.my_image }}
  {{#set img_url = section.settings.my_image | image_url() /}}
{{#else/}}
  {{#set img_url = `fallback.jpg` | asset_url() /}}
{{/if}}
<img src="{{ img_url }}" alt="">
```

### 7.3 Common setting types

- Content: `text`, `textarea`, `richtext`, `image`, `url`, `menu`, `video`, `product`, `collection`
- Inputs: `switch`, `range`, `select`, `checkbox`, `radio`, `number`
- **`color_scheme`** — palette picker bound to theme-wide schemes (see [§8](color-schemes.md))
- **`style.layout` / `style.spacing` / `style.size`** — responsive layout controls with per-breakpoint values (see [§9](responsive-controls.md))

### 7.4 Template groups

- **Header / footer:** `header-group.json`, `footer-group.json`
- **Page body:** `templates/index.json` (and other templates) — merchants add most custom sections here, not inside header/footer groups

---

