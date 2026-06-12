# Shopline OS 3.0 — Bottle Theme Playbook

**Version:** 1.0  
**Audience:** Developers and AI agents building or migrating storefront themes on Shopline OS 3.0 using the Bottle template engine.  
**Scope:** Brand-neutral. Reusable across projects.

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Principles](#2-principles)
3. [Directory structure](#3-directory-structure)
4. [Naming conventions](#4-naming-conventions)
5. [Bottle template syntax](#5-bottle-template-syntax)
6. [Components, sections, and blocks](#6-components-sections-and-blocks)
7. [Schemas and i18n](#7-schemas-and-i18n)
8. [Color schemes (theme-wide, every section)](#8-color-schemes-theme-wide-every-section)
9. [Native responsive layout, spacing & size controls](#9-native-responsive-layout-spacing--size-controls)
10. [Assets, fonts, and CDN](#10-assets-fonts-and-cdn)
11. [Migration workflow](#11-migration-workflow)
12. [Shopify Liquid → Bottle cheat sheet](#12-shopify-liquid--bottle-cheat-sheet)
13. [Gotchas and troubleshooting](#13-gotchas-and-troubleshooting)
14. [Completion checklist](#14-completion-checklist)
15. [CLI reference](#15-cli-reference)

---

## 1. Quick start

Use this checklist when starting a new theme or migration:

- [ ] Install Shopline CLI (`sl`) and log in: `sl login --store https://your-store.myshopline.com`
- [ ] Clone or pull the base Bottle theme: `sl theme pull`
- [ ] Run local preview: `sl theme serve` (Node 18+ recommended)
- [ ] Map target pages (home, collection, PDP, cart, account, static pages) to `templates/*.json`
- [ ] Plan **header-group.json** and **footer-group.json** (global nav/footer)
- [ ] Use **kebab-case** for all file paths; **snake_case** for schema IDs and `t:` keys
- [ ] Register section-local blocks with a **`$` prefix** (see [§6.3](#63-section-local-blocks--prefix))
- [ ] Put static files in **`public/`**; reference with `` {{ `path/file.ext` | asset_url() }} ``
- [ ] Load custom fonts via a **`components/.../fonts.html`** partial with `@font-face` + `asset_url()`, not raw paths in `.css`
- [ ] Add **`presets`** to every custom section so it appears in **Add section**
- [ ] Add labels to **`i18n/en.schema.json`** for every new section/block
- [ ] Validate PDP and cart after changes (apps depend on native DOM)

---

## 2. Principles

### 2.1 Reusability

Build for reuse across stores, not one merchant.

| Prefer | Avoid |
|--------|--------|
| Generic section names (`hero-banner`, `text-image`) | Store- or campaign-specific names |
| Neutral default copy (“Heading”, “Shop now”) | Brand slogans in schema defaults |
| Configurable spacing, typography, color schemes | Hardcoded hex, inline styles |
| Modular sections and blocks | Monolithic page-only HTML |

### 2.2 Theme vs apps

| In theme | In apps |
|----------|---------|
| Layout, styling, responsive grids, animations | Subscriptions, reviews, wishlists, loyalty |
| App embed placeholders, stable DOM hooks | Business logic, CRM, advanced search |
| Cart drawer / layout styling | Store locator backends, live chat engines |

Do not rebuild app functionality inside the theme.

### 2.3 Product page (PDP) safety

**Critical:** Subscription apps, variant pickers, dynamic checkout, reviews, and merchandising blocks rely on the **default Bottle PDP / product form DOM**.

- Extend PDP incrementally (settings, classes, surrounding sections).
- Do **not** replace core variant selectors, price nodes, or add-to-cart wrappers.
- Add merchandising as separate sections above/below the product form, or as blocks.

### 2.4 Typography and spacing

Expose typography and spacing through **theme settings** and section schemas where possible. Avoid magic numbers in CSS unless they are design tokens in a shared `public/.../tokens.css` (optional pattern).

### 2.5 Color schemes

Every section a merchant can add must expose a **`color_scheme`** setting so all theme-wide schemes are selectable on that section, and the section must **inherit its colors from the selected scheme** via `--color-*` CSS variables. Never hardcode brand colors in section CSS. See [§8](#8-color-schemes-theme-wide-every-section).

### 2.6 Responsive layout via native controls

Use Shopline's native **`style.layout` / `style.spacing` / `style.size`** settings (rendered with `class_list()`) so merchants can adjust flex layout, padding, and dimensions **separately for desktop and mobile** from the customizer. Avoid fixed pixel layout in CSS where a native control can own it. See [§9](#9-native-responsive-layout-spacing--size-controls).

---

## 3. Directory structure

```text
├── blocks/                 # Global blocks (embedded in sections)
├── components/             # Reusable partials (props-based; no snippets/)
├── i18n/
│   ├── en.json             # Storefront strings
│   └── en.schema.json      # Customizer / schema labels
├── layout/
│   └── theme.html          # Master layout
├── public/                 # Static assets (images, fonts, JS, CSS)
├── sections/               # One folder per section
│   └── example-section/
│       ├── example-section.html
│       ├── example-section.css
│       ├── example-section.js
│       └── blocks/         # Section-local blocks (optional)
├── templates/              # Page JSON (section order + settings)
│   └── index.json
├── sections/header-group.json
├── sections/footer-group.json
├── theme.config.json       # Live customizer state / presets
└── theme.schema.json       # Global theme settings schema
```

There is **no `snippets/` folder**. Shopify snippets map to **`components/`**.

---

## 4. Naming conventions

| Layer | Convention | Example |
|-------|------------|---------|
| Files & folders | **kebab-case** | `announcement-bar.html`, `hero-banner/` |
| Schema setting `id` | **snake_case** | `button_label`, `color_scheme` |
| i18n / `t:` keys | **snake_case** | `t:sections.hero_banner.name` |
| Section-local block `type` | **`$` + kebab-case** | `"$nav-link"`, `"$feature-card"` |

**Wrong:** `announcement_bar.html`, `t:sections.announcement-bar.name`, block type `"nav-link"` without `$` in section-local blocks.

### 4.1 Brand-neutral section & block names (required)

Section folders, file names, schema IDs, block types, and `t:` keys must describe **what the component is/does**, never a specific store, brand, campaign, or person. The same name should make sense if the theme is reused on any unrelated store.

| Use (functional / descriptive) | Avoid (brand- or campaign-specific) |
|--------------------------------|-------------------------------------|
| `hero-banner/`, `header/`, `footer/` | `sunday-hero/`, `acme-header/` |
| `image-with-text/`, `feature-grid/` | `dolce-vita-band/`, `summer-sale-grid/` |
| `testimonial-list/`, `logo-bar/` | `oprah-reviews/`, `vogue-logos/` |
| `newsletter-signup/`, `store-locator/` | `berry-newsletter/`, `find-us-near-you/` |
| block `"$feature-card"`, `"$nav-link"` | block `"$tutti-tile"`, `"$fritto-feature"` |
| `t:sections.hero_banner.name` | `t:sections.sunday_hero.name` |

Rules:

- Name by **role and layout** (`hero-banner`, `media-with-text`, `collection-list`), not by the content a particular merchant happens to put in it.
- **No proper nouns** — store names, product line names, place names, or marketing slogans never appear in folder/file/ID names.
- If you must namespace to avoid collisions with base sections, use a **neutral, theme-level prefix** (e.g. `custom-`, `theme-`), not a brand prefix (e.g. not `sunday-`).
- Keep merchant-specific wording to **content** (preset/`i18n` default strings), which is editable — never bake it into structural names.
- When migrating an existing brand-named theme, **rename brand-prefixed sections** to functional equivalents as part of modularization.

---

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
- **`color_scheme`** — palette picker bound to theme-wide schemes (see [§8](#8-color-schemes-theme-wide-every-section))
- **`style.layout` / `style.spacing` / `style.size`** — responsive layout controls with per-breakpoint values (see [§9](#9-native-responsive-layout-spacing--size-controls))

### 7.4 Template groups

- **Header / footer:** `header-group.json`, `footer-group.json`
- **Page body:** `templates/index.json` (and other templates) — merchants add most custom sections here, not inside header/footer groups

---

## 8. Color schemes (theme-wide, every section)

Color schemes are the theme's palette system. A scheme is a named set of colors (background, text, button, etc.). When defined once, **every** scheme becomes selectable on **every** section that exposes a `color_scheme` setting, and the section renders itself using that scheme's colors. This is how a merchant recolors any section without touching CSS.

There are four moving parts. All four are required for a section to "take its colors" from the selected scheme.

### 8.1 Where schemes are defined — `theme.config.json`

Schemes live under `theme.color_schemes` in the active preset. Each scheme has an `id` (`scheme-1`, `scheme-2`, …) and a `settings` object of colors:

```json
"theme": {
  "color_schemes": {
    "scheme-1": {
      "settings": {
        "color_background": "#F3F2E0",
        "color_text": "#3D3819",
        "color_button_background": "#3D3819",
        "color_button_text": "#F3F2E0",
        "color_button_secondary_background": "#F3F2E0",
        "color_button_secondary_text": "#3D3819",
        "color_button_secondary_border": "#726C4A",
        "color_button_text_link": "#3D3819",
        "color_card_background": "rgba(0,0,0,0)",
        "color_media_background": "#F3F3F3",
        "color_light_text": "#726C4A",
        "color_entry_line": "#CBCBCB"
      }
    },
    "scheme-2": { "settings": { "...": "..." } }
  }
}
```

**To adjust palettes:** edit colors here (or via the customizer's *Colors* settings). Add a new `scheme-N` block to introduce a new palette. Because sections reference schemes by `id`, adding/adjusting a scheme **automatically makes it available in every section's color-scheme picker** — no per-section edit needed.

> Keep the **same set of color keys** across all schemes so every `--color-*` variable resolves in every scheme.

### 8.2 Where schemes become CSS — `components/theme-css-var.html`

A single loop turns every scheme into a `.color-{id}` class exposing `--color-*` variables. This component is loaded once in `layout/theme.html`:

```handlebars
{{#for scheme in settings.color_schemes}}
.color-{{scheme.id}} {
  --color-background: {{scheme.settings.color_background.red}},{{scheme.settings.color_background.green}},{{scheme.settings.color_background.blue}};
  --color-text: {{scheme.settings.color_text.red}},{{scheme.settings.color_text.green}},{{scheme.settings.color_text.blue}};
  --color-button-background: {{scheme.settings.color_button_background.red}},{{scheme.settings.color_button_background.green}},{{scheme.settings.color_button_background.blue}};
  --color-button-text: {{scheme.settings.color_button_text.red}},{{scheme.settings.color_button_text.green}},{{scheme.settings.color_button_text.blue}};
  /* ...one line per color key... */
  color: rgba(var(--color-text));
}
{{/for}}
```

Color values are exposed as **`R, G, B` triplets**, so always wrap them in `rgba(var(--color-x))` (optionally with alpha) in CSS. Adding a scheme to `theme.config.json` requires **no change here** — the loop emits its class automatically.

### 8.3 Step 1 — expose the picker in the section schema

Every merchant-addable section adds a `color_scheme` setting:

```json
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "t:sections.my_section.settings.color_scheme.label",
  "default": "scheme-1"
}
```

The picker lists **all** schemes from `theme.config.json` automatically. Choose a sensible `default` per section.

### 8.4 Step 2 — apply the scheme class in the template

Put `color-{{ section.settings.color_scheme.id }}` on the section's outer (or content) element:

```handlebars
<div class="my-section color-{{ section.settings.color_scheme.id }}">
  {{#content "blocks" /}}
</div>
```

For a block-level scheme picker use `color-{{ block.settings.color_scheme.id }}` on the block element.

### 8.5 Step 3 — consume the variables in section CSS

Section CSS references the scheme variables instead of fixed colors, so the section recolors itself whenever the scheme changes:

```css
.my-section {
  background-color: rgba(var(--color-background));
  color: rgba(var(--color-text));
}
.my-section .button {
  background-color: rgba(var(--color-button-background));
  color: rgba(var(--color-button-text));
}
.my-section .rule {
  border-color: rgba(var(--color-entry-line), 0.4); /* alpha via the triplet */
}
```

### 8.6 Available scheme variables

| Variable | Purpose |
|----------|---------|
| `--color-background` | Section background |
| `--color-text` | Primary text |
| `--color-light-text` | Secondary / muted text |
| `--color-card-background` | Card surface |
| `--color-media-background` | Image/media placeholder background |
| `--color-entry-line` | Borders / dividers / input lines |
| `--color-button-background` / `--color-button-text` | Primary button |
| `--color-button-secondary-background` / `--color-button-secondary-text` / `--color-button-secondary-border` | Secondary button |
| `--color-button-text-link` | Inline text links |

### 8.7 Checklist — "section takes its colors"

- [ ] Scheme exists / adjusted in `theme.config.json` (`color_schemes`)
- [ ] `theme-css-var.html` loop emits a line for every color key used
- [ ] Section schema has a `color_scheme` setting with a `default`
- [ ] Template applies `color-{{ section.settings.color_scheme.id }}`
- [ ] Section CSS uses `rgba(var(--color-*))`, **no hardcoded hex**
- [ ] Verified by switching schemes in the customizer

---

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

## 10. Assets, fonts, and CDN

### 10.1 Static files

Place files under **`public/`** (e.g. `public/fonts/`, `public/images/`).

### 10.2 Do not use relative URLs in `.css`

`url(../fonts/font.woff2)` in static CSS **breaks on CDN**. Use:

1. `components/brand-fonts/fonts.html` (or similar) with inline `<style>` and `@font-face`
2. `` url('{{ `fonts/my-font.woff2` | asset_url() }}') ``

Load that component from `layout/theme.html` before stylesheets.

### 10.3 Stylesheets and scripts in sections

```handlebars
{{#component "stylesheet" src="./my-section.css" | asset_url() /}}
{{#component "script" src="./my-section.js" | asset_url() /}}
```

### 10.4 Optional design tokens

For design-heavy rebuilds, a shared `public/theme/tokens.css` loaded in `layout/theme.html` keeps brand primitives in one place. Sections use semantic classes, not scattered hex values.

---

## 11. Migration workflow

### Phase A — Discovery

1. Inventory pages, templates, and key components (nav, hero, grids, PDP, cart, footer).
2. Download fonts, images, SVGs into `public/`.
3. Note breakpoints, interactions, and third-party apps/widgets.

### Phase B — Global foundation

1. Configure `layout/theme.html` (CSS/JS order, font partial, optional tokens).
2. Replace or extend header/footer via group JSON files.
3. Define all **color schemes** in `theme.config.json` and confirm `theme-css-var.html` emits a `.color-{id}` class per scheme ([§8](#8-color-schemes-theme-wide-every-section)).
4. Register typography in theme settings / `theme.schema.json`.

### Phase C — Monolithic validation (optional)

1. Build one `sections/staging-page/` with namespaced wrapper (e.g. `.staging-page-inner`) to validate CSS fidelity.
2. Wire `templates/page.staging.json` for preview.
3. Compare in browser before splitting into modules.

### Phase D — Modularize

1. Split into logical sections under `sections/`.
2. Each section: `.html` + `.css` + `.js` + `{{#schema}}` + presets.
3. Add a **`color_scheme`** setting + apply `color-{{ ...color_scheme.id }}`, and CSS consuming `rgba(var(--color-*))` ([§8](#8-color-schemes-theme-wide-every-section)).
4. Add **`style.layout` / `style.spacing` / `style.size`** settings with `@media (--mobile)` overrides + render via `{{ section.settings | class_list() }}` ([§9](#9-native-responsive-layout-spacing--size-controls)).
5. Wire `templates/index.json` (and others) with `order` and block data.

### Phase E — Dynamic bindings

1. Move hardcoded copy/images into schema settings.
2. Apply image URL variable pattern for all images.
3. Add i18n keys for customizer labels.

### Phase F — Integrate platform features

1. Native forms: `{{#contact_form}}`, `{{#customer_form}}`, etc., with correct `name` attributes.
2. Cart drawer: respect `settings.cart_add_type`; use `components/cart/cart-drawer` patterns.
3. SEO: logical heading order (`h1` → `h2` → `h3`, no skips).

### Phase G — QA

1. Visual comparison at mobile / tablet / desktop.
2. Customizer: all sections addable, blocks editable, images uploadable.
3. PDP, cart, checkout buttons, and app blocks smoke-tested.

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

## 13. Gotchas and troubleshooting

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Section blocks never render | Missing `$` on section-local block types | Prefix type with `$`; match in `forblock.type` |
| `invalid syntax` on compile | Single quotes in filters | Use `default("text")` with double quotes |
| Image setting prints object / breaks | Treated image as string | Use `image_url()` + `{{#var }}` fallback |
| Font 404 | Font path only in `.css` | `@font-face` in HTML component + `asset_url()` |
| `cart-bubble.js` 404 | Wrong `asset_url` path | Point to `components/...` or `public/...` explicitly |
| Custom element inert (no click) | JS not loaded | Verify script `src` resolves; check console |
| Link styled as body link, not button | `a:not(.button)` in base CSS | Higher-specificity rules for `a.cta-class` |
| Headings wrong in SEO audit | Skipped levels | Footer/section outline: `h2` then `h3`, not `h4` after `h2` |
| Section missing in customizer | No `presets` | Add `presets` to schema |
| Image field missing in editor | `image_picker` type | Use `"type": "image"` |
| Variables empty mid-template | `{{#var }}` declared too late | Move vars to top of file |
| Grid titles one letter per line | `word-break: break-word` on headings | `word-break: normal` on display headings |
| Sticky header gap wrong | Announcement bar height | Reuse `theme-sticky-header` + `theme-announcement-bar-sticky` pattern from base header |
| New scheme not selectable on a section | Section missing `color_scheme` setting | Add `color_scheme` setting; schemes from `theme.config.json` populate automatically |
| Section ignores selected scheme | Hardcoded hex in CSS / missing `color-{id}` class | Apply `color-{{ ...color_scheme.id }}` + use `rgba(var(--color-*))` |
| Color variable renders as `#000` / invalid | Forgot `rgba()` wrapper around the R,G,B triplet | Use `rgba(var(--color-text))` not `var(--color-text)` |
| Customizer spacing/layout has no effect | Value also hardcoded in `.css`, or `class_list()` missing | Render `{{ settings | class_list() }}`; remove the duplicate CSS rule |
| Mobile spacing same as desktop | No `@media (--mobile)` block in the `style.*` default | Add `"@media (--mobile)"` overrides to the setting |

---

## 14. Completion checklist

Before marking work complete:

- [ ] Section/block **names** (folders, files, schema IDs, block types, `t:` keys) are brand-neutral and functional — no store/product/person/campaign names ([§4.1](#41-brand-neutral-section--block-names-required))
- [ ] Default copy/strings are brand-neutral (merchant wording only in editable content)
- [ ] All custom sections have `presets` and `i18n` schema entries
- [ ] Section-local blocks use `$` prefix consistently
- [ ] Images use `image` type + URL variable fallback pattern
- [ ] Fonts and CDN assets use `asset_url()` with backticks
- [ ] `{{{ block.shopline_attributes }}}` on block roots
- [ ] **Every merchant-addable section exposes a `color_scheme` setting** and applies `color-{{ ...color_scheme.id }}`
- [ ] Section CSS uses `rgba(var(--color-*))` — **no hardcoded palette hex**
- [ ] Adjusting/adding a scheme in `theme.config.json` appears in every section's picker
- [ ] **Sections expose `style.layout` / `style.spacing` / `style.size`** with `@media (--mobile)` overrides, rendered via `class_list()`
- [ ] Spacing/layout owned by native controls is **not** duplicated in `.css`
- [ ] PDP / cart / product form not structurally broken
- [ ] Mobile and desktop layouts verified (toggle device in customizer)
- [ ] No hardcoded store URLs or merchant-specific copy in theme code
- [ ] `sl theme serve` runs without template errors

---

## 15. CLI reference

```bash
# Authenticate
sl login --store https://your-store.myshopline.com

# Download theme
sl theme pull

# Local dev server
sl theme serve

# Upload changes
sl theme push

# Package for distribution
sl theme pack
```

Preview URL is printed by `sl theme serve` (typically `http://127.0.0.1:8282`).

---

## Optional tooling

Some repositories include `scripts/replicate-page.js` to scrape a URL into a monolithic staging section. Use only if present in the project; treat output as a starting point, then modularize per Phase D.

---

*End of playbook.*
