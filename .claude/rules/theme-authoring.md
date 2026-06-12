---
paths:
  - "sections/**/*"
  - "blocks/**/*"
  - "templates/**/*"
  - "i18n/**/*"
---
# Rule: Theme authoring (auto-loaded when editing sections/blocks/templates)
Authority: `docs/craft/sline-syntax.md`, `docs/craft/components-sections-blocks.md`, `docs/craft/schemas-and-i18n.md`, `docs/principles/implementation-principles.md`.

- Sline only: `.html` files with `{{#schema}} ... {{/schema}}`; never Liquid syntax or `config/settings_schema.json`.
- Files/folders use kebab-case; schema setting IDs and `t:` keys use snake_case.
- Structural names are brand-neutral and role-based. Brand/product/campaign wording belongs in editable settings/content only.
- Section-local block types use `$` + kebab-case in schema and must match the `forblock.type` checks in templates.
- Every merchant-addable section has a schema with `presets`, i18n label keys in `i18n/en.schema.json`, and real defaults.
- Image settings use `"type": "image"`; render with `image_url()` and fallback to `asset_url()` for bundled assets.
- Block roots include `{{{ block.shopline_attributes }}}` so the customizer can select/reorder blocks.
- Templates compose reusable sections and blocks through `templates/*.json`; do not embed one-off page HTML.
