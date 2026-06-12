---
paths:
  - "sections/**/*"
  - "blocks/**/*"
  - "templates/**/*"
  - "i18n/**/*"
---
# Rule: Theme authoring (auto-loaded when editing sections/blocks/templates)
> STATUS: STUB — fill from Playbook §4, §6, §7 + docs/craft.
- kebab-case files; snake_case schema IDs & `t:` keys; `$`-prefix section-local blocks (+ match `forblock.type`).
- Image type `image`; `{{#var}}` URL fallback via `image_url()` / `asset_url()`.
- Every section: `{{#schema}}` with `presets` + matching `i18n/en.schema.json` labels.
- `{{{ block.shopline_attributes }}}` on block roots. Brand-neutral names + defaults.
