# Craft: Native Responsive Controls
> **Authority: craft.** **Trust: ⚠️ inherited.** This is how pixel-close DESKTOP+MOBILE is achieved in modular sections (`style.*` + `@media (--mobile)` + `class_list()`).

## 9. Native responsive layout, spacing & size controls

Shopline ships **native customizer controls** that let merchants tune layout, padding/margins, and dimensions **independently for desktop and mobile** — no custom media queries required. They are schema setting types whose value is an object of CSS declarations (plus an optional `@media (--mobile)` override), rendered to the DOM with the **`class_list()`** filter.

### 9.1 The three control types

| Type | Controls | Typical keys |
|------|----------|--------------|
| `style.layout` | Flexbox layout of children | `flex-direction`, `flex-wrap`, `align-items`, `justify-content`, `row-gap`, `column-gap` |
| `style.spacing` | Padding / margin | `padding-top/right/bottom/left` (or logical `padding-block-start`, `padding-inline-end`, …) |
| `style.size` | Element dimensions | `width`, `height` |

### 9.2 Schema: desktop + mobile in one setting

Provide the desktop values at the top level and the **mobile overrides under `"@media (--mobile)"`**. The customizer renders a device toggle so merchants edit each breakpoint separately.

```json
{
  "type": "style.layout",
  "id": "layout",
  "label": "t:sections.my_section.settings.layout.label",
  "default": {
    "flex-direction": "row",
    "flex-wrap": "nowrap",
    "align-items": "center",
    "justify-content": "center",
    "column-gap": "80px",
    "row-gap": "80px",
    "@media (--mobile)": {
      "flex-direction": "column",
      "align-items": "flex-start",
      "column-gap": "10px",
      "row-gap": "10px"
    }
  }
},
{
  "type": "style.spacing",
  "id": "spacing",
  "label": "t:sections.my_section.settings.spacing.label",
  "default": {
    "padding-top": "100px",
    "padding-right": "30px",
    "padding-bottom": "100px",
    "padding-left": "30px",
    "@media (--mobile)": {
      "padding-top": "24px",
      "padding-right": "20px",
      "padding-bottom": "24px",
      "padding-left": "20px"
    }
  }
},
{
  "type": "style.size",
  "id": "size",
  "label": "t:sections.my_section.settings.size.label",
  "default": { "width": "100%", "height": "auto" }
}
```

### 9.3 Template: render with `class_list()`

`class_list()` turns the style settings on a `settings` object into the generated classes (with the responsive variants baked in). Pass `section.settings` (or `block.settings`) through it on the element you want to control:

```handlebars
<div class="my-section color-{{ section.settings.color_scheme.id }}">
  <div class="page-width {{ section.settings | class_list() }}">
    {{#content "blocks" /}}
  </div>
</div>
```

For a block:

```handlebars
<div class="{{ block.settings | class_list() }} my-block" {{{ block.shopline_attributes }}}>
  {{#content "blocks" /}}
</div>
```

`class_list()` reads **every** `style.*` setting on that settings object, so one call covers `layout`, `spacing`, and `size` together. The element receiving the `style.layout` classes becomes the **flex container** for its direct children.

### 9.4 Rules & gotchas

- **Put `class_list()` on the right element.** `style.layout` styles the *container* of the children you want to arrange; `style.spacing`/`style.size` style the element they're placed on.
- **Don't duplicate in CSS.** If padding/gap/flex is owned by a native control, do not also set it in the section `.css` — the customizer value must win. Reserve CSS for things merchants shouldn't tune.
- **Mobile breakpoint** is the platform's `--mobile` media alias; only list the keys you want to override there (others inherit the desktop value).
- **Logical vs physical properties:** both `padding-left/right` and `padding-inline-start/end` are valid; pick one style and stay consistent within a section.
- **Pair with color scheme:** a well-formed section element usually carries both `color-{{ ...color_scheme.id }}` and `{{ ... | class_list() }}`.
- **i18n:** add `settings.layout.label`, `settings.spacing.label`, `settings.size.label` keys to `i18n/en.schema.json`.

### 9.5 Minimal section combining color + responsive controls

```handlebars
{{#component "stylesheet" src="./my-section.css" | asset_url() /}}

<div class="my-section color-{{ section.settings.color_scheme.id }}" data-section-id="{{ section.id }}">
  <div class="page-width {{ section.settings | class_list() }}">
    {{#content "blocks" /}}
  </div>
</div>

{{#schema}}
{
  "name": "t:sections.my_section.name",
  "settings": [
    { "type": "color_scheme", "id": "color_scheme", "label": "t:sections.my_section.settings.color_scheme.label", "default": "scheme-1" },
    { "type": "style.layout",  "id": "layout",  "label": "t:sections.my_section.settings.layout.label",  "default": { "flex-direction": "row", "align-items": "center", "justify-content": "center", "column-gap": "40px", "row-gap": "40px", "@media (--mobile)": { "flex-direction": "column", "column-gap": "16px", "row-gap": "16px" } } },
    { "type": "style.spacing", "id": "spacing", "label": "t:sections.my_section.settings.spacing.label", "default": { "padding-top": "80px", "padding-bottom": "80px", "@media (--mobile)": { "padding-top": "32px", "padding-bottom": "32px" } } }
  ],
  "presets": [ { "name": "t:sections.my_section.presets.presets_0.name", "settings": {} } ]
}
{{/schema}}
```

```css
.my-section { background-color: rgba(var(--color-background)); color: rgba(var(--color-text)); }
```

---

