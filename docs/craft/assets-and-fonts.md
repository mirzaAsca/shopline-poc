# Craft: Assets, Fonts & CDN
> **Authority: craft.** **Trust: ⚠️ inherited.** Assets for migrations are pre-hosted under `public/images` (see migration-decisions); the font/CDN rules below still apply to any new assets.

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

