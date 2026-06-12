---
paths:
  - "sections/**/*"
  - "theme.config.json"
  - "components/theme-css-var.html"
---
# Rule: Color schemes (auto-loaded when editing sections / theme.config / theme-css-var)
> STATUS: STUB — fill from Playbook §8.
- Section exposes `color_scheme` setting; apply `color-{{ section.settings.color_scheme.id }}`.
- Section CSS uses `rgba(var(--color-*))` — NO hardcoded hex.
