# Runbook: Build a section

> Use when authoring a new modular Bottle section (the **productized** default — see [../principles/migration-decisions.md](../principles/migration-decisions.md)).

## Recipe
1. **Name** it by role, brand-neutral, kebab-case: `sections/<name>/<name>.html` (+ `.css`, `.js`). See [../principles/implementation-principles.md](../principles/implementation-principles.md).
2. **Markup** in Sline (not Liquid): [../craft/sline-syntax.md](../craft/sline-syntax.md). Block area via `{{#content "blocks" /}}` / `{{#blocks}}`: [../craft/components-sections-blocks.md](../craft/components-sections-blocks.md). Section-local blocks need the `$` prefix.
3. **Schema** at the bottom (`{{#schema}}`) with `presets` + i18n labels: [../craft/schemas-and-i18n.md](../craft/schemas-and-i18n.md). Images use `type: image` + `image_url()`.
4. **Color**: add a `color_scheme` setting, apply `color-{{ section.settings.color_scheme.id }}`, style with `rgba(var(--color-*))` — no hex. [../craft/color-schemes.md](../craft/color-schemes.md).
5. **Responsive**: add `style.layout` / `style.spacing` / `style.size` with `@media (--mobile)` overrides; render via `{{ section.settings | class_list() }}`. Don't duplicate in CSS. [../craft/responsive-controls.md](../craft/responsive-controls.md).
6. **Assets/fonts** via `asset_url()` (backticks), never relative URLs in `.css`: [../craft/assets-and-fonts.md](../craft/assets-and-fonts.md).
7. **Wire** it into a template (`templates/*.json`) with `order` + block instances: [../ops/theme-architecture.md](../ops/theme-architecture.md).
8. **Verify** desktop + mobile; switch color schemes in the customizer. See the audit checklist: [audit-a-theme.md](audit-a-theme.md).

> A minimal section combining color + responsive controls is in [../craft/responsive-controls.md](../craft/responsive-controls.md) (§9.5).
