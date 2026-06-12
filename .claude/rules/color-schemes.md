---
paths:
  - "sections/**/*"
  - "theme.config.json"
  - "components/theme-css-var.html"
---
# Rule: Color schemes (auto-loaded when editing sections / theme.config / theme-css-var)
Authority: `docs/craft/color-schemes.md`, `docs/principles/implementation-principles.md`.

- Every merchant-addable section exposes a `color_scheme` setting with a default.
- Apply the selected scheme on the section root with `color-{{ section.settings.color_scheme.id }}`.
- Section CSS reads from scheme variables such as `rgba(var(--color-text))`, `rgba(var(--color-background))`, and button/card variables.
- Do not hardcode brand hex/rgb values in section CSS. Put brand colors in `theme.config.json` color schemes.
- When adding/changing global schemes, keep `theme.config.json` and `components/theme-css-var.html` behavior aligned with the existing Bottle pattern.
