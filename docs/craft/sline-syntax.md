# Craft: Sline Template Syntax
> **Authority: craft** (Playbook wins on conflict). **Trust: ⚠️ inherited** from prior builds; cross-check against this repo's `sections/` when unsure.
> Cross-refs to other craft modules: §6→`components-sections-blocks.md`, §7→`schemas-and-i18n.md`, §8→`color-schemes.md`, §9→`responsive-controls.md`.

## 5. Bottle template syntax

Handlebars-like tags + pipe filters. Not Shopify Liquid.

### 5.1 Escaping

| Syntax | Use |
|--------|-----|
| `{{ expr }}` | Escaped output (text) |
| `{{{ expr }}}` | Raw HTML (rich text, `shopline_attributes`) |

### 5.2 Variables

```handlebars
{{#var image_url = "" /}}
{{#if section.settings.image }}
  {{#set image_url = section.settings.image | image_url() /}}
{{#else/}}
  {{#set image_url = `placeholder.png` | asset_url() /}}
{{/if}}
```

Declare fallback assets at the **top** of the file (before use).

### 5.3 Conditionals

```handlebars
{{#if condition }}
  ...
{{#else if other_condition /}}
  ...
{{#else/}}
  ...
{{/if}}
```

`{{#else if ... /}}` and `{{#else/}}` are **self-closing** (trailing `/`).

### 5.4 Loops

```handlebars
{{#for item in collection.products }}
  {{ item.title }}
{{/for}}

{{#for _ in 1 | range(4) }}
  <div class="skeleton"></div>
{{/for}}
```

### 5.5 Capture

```handlebars
{{#capture html }}
  {{#component "icons/star" /}}
{{/capture}}
{{{ html }}}
```

### 5.6 Compiler rules (summary)

| Rule | Detail |
|------|--------|
| Filter string args | Use **double quotes** inside filters: `default("Fallback")` |
| No nested pipes in params | Set a `{{#var }}` first, then pass to `default()` |
| Asset paths in templates | Use **backticks**: `` {{ `file.css` | asset_url() }} `` |
| Filter calls | Include parentheses: `asset_url()`, `t()`, `image_url()` |

---
## 12. Shopify Liquid → Bottle cheat sheet

| Shopify | Bottle |
|---------|--------|
| `{% assign x = y %}` | `{{#var x = y /}}` |
| `{% assign x = z %}` | `{{#set x = z /}}` |
| `{% if %}` / `{% endif %}` | `{{#if }}` / `{{/if}}` |
| `{% elsif %}` | `{{#else if cond /}}` |
| `{% else %}` | `{{#else/}}` |
| `{% for %}` / `{% endfor %}` | `{{#for }}` / `{{/for}}` |
| `{% render 'x' %}` | `{{#component "x" /}}` |
| `{{ 'a' \| asset_url }}` | `` {{ `a` \| asset_url() }} `` |
| `{{ 'k' \| t }}` | `{{ "k" \| t() }}` |
| `{{ block.shopify_attributes }}` | `{{{ block.shopline_attributes }}}}` |
| `content_for_layout` | `{{#content "layout" /}}` (layout slots vary; check base theme) |

| Context | Bottle |
|---------|--------|
| Global settings | `settings` |
| Section | `section`, `section.settings` |
| Block | `block`, `block.settings`, `forblock` in `{{#blocks}}` |
| Routes | `routes` |
| Page type | `request.page_type` |
| Cart | `cart` |

---
