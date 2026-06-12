# Runbook: Audit a theme

> Review a Bottle theme against the principles + craft rules. Pair with [../troubleshooting.md](../troubleshooting.md) for symptom→fix.

Check naming/`$`-blocks/image-type/assets/PDP-risk/missing presets+i18n/color+responsive compliance. Use the checklist below.

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
