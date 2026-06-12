# Craft: Color Schemes (theme-wide)
> **Authority: craft.** **Trust: ⚠️ inherited** (mechanism not re-verified this POC, but matches this repo's `theme.config.json` + `components/theme-css-var.html`).
> This is the redesign + pixel-close color engine. All four moving parts are required.

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

> **Why `.red`/`.green`/`.blue` work:** SHOPLINE parses each hex/rgba string in `theme.config.json` (e.g. `"#F3F2E0"`) into a color object at runtime, so `scheme.settings.color_x.red` / `.green` / `.blue` resolve to the 0–255 channel values the loop above emits.

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

