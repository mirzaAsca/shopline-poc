# Craft: Components, Sections & Blocks
> **Authority: craft.** **Trust: ⚠️ inherited.** The `$`-prefix rule for section-local blocks is critical — match it in `forblock.type`.

## 6. Components, sections, and blocks

### 6.1 Components

```handlebars
{{#component "stylesheet" src="base/index.css" | asset_url() preload=true /}}
{{#component "image" data=section.settings.image class="hero__img" /}}
```

Props are isolated under `props` in the component file.

Relative paths:

- From `sections/my-section/my-section.html`: `./components/foo.html` or `../other-section/components/bar.js`
- From `components/cart/cart-bubble.html`: `./cart-bubble.js`
- Shared JS in `components/cart/`: reference as `cart/cart-bubble.js` from section root **only if** that path resolves via `asset_url` (prefer paths relative to known component locations)

**Script path rule:** `cart/cart-bubble.js` in `asset_url` often maps to `public/cart/`, not `components/cart/`. From a section, use `` {{#component "script" src="../../components/cart/cart-bubble.js" | asset_url() /}} `` or load scripts from a component partial under `components/`.

### 6.2 Sections and `{{#blocks}}`

```handlebars
<div class="rich-text" data-section-id="{{ section.id }}">
  {{#blocks}}
    {{#block section_settings=section.settings /}}
  {{/blocks}}
</div>
```

### 6.3 Section-local blocks (`$` prefix)

Blocks defined under `sections/my-section/blocks/` must use a **`$` prefix** in schema and templates:

**Schema:**

```json
"blocks": [
  { "type": "$nav-link" }
]
```

**Template:**

```handlebars
{{#blocks}}
  {{#if forblock.type == "$nav-link" }}
    <a href="{{ forblock.settings.link }}">{{ forblock.settings.label }}</a>
  {{/if}}
{{/blocks}}
```

**Preset / template JSON:**

```json
"blocks": {
  "item-1": { "type": "$nav-link", "settings": { "label": "Shop", "link": "/collections/all" } }
}
```

Without `$`, section-local blocks may not render or match in `forblock.type`.

### 6.4 Global blocks

Blocks under `blocks/` (theme root) use types **without** `$` (e.g. `"heading"`, `"button"`).

### 6.5 Customizer attributes

On the outer element of every block:

```handlebars
<div {{{ block.shopline_attributes }}}>
```

---

