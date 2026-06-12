---
paths:
  - "sections/**/*"
  - "blocks/**/*"
---
# Rule: Responsive native controls (auto-loaded when editing sections/blocks)
> STATUS: STUB — fill from Playbook §9.
- Expose `style.layout` / `style.spacing` / `style.size` with `@media (--mobile)` overrides.
- Render with `{{ section.settings | class_list() }}`; don't duplicate that spacing/layout in CSS.
