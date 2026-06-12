---
paths:
  - "sections/**/*"
  - "blocks/**/*"
---
# Rule: Responsive native controls (auto-loaded when editing sections/blocks)
Authority: `docs/craft/responsive-controls.md`, `docs/principles/implementation-principles.md`.

- Prefer SHOPLINE native `style.layout`, `style.spacing`, and `style.size` settings for merchant-controlled layout, padding/margins, and dimensions.
- Include desktop defaults plus `@media (--mobile)` overrides where the source has distinct mobile behavior.
- Render native control classes with `{{ section.settings | class_list() }}` or `{{ block.settings | class_list() }}` on the relevant root.
- Do not duplicate the same spacing/layout values in CSS; CSS should handle structure and states the native controls cannot express.
- Verify both desktop and mobile after edits. A desktop-only match is incomplete.
