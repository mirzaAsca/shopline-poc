# Implementation Principles (READ FIRST)
> **Authority: principles.** From Playbook §2 + §4.1. Internalize before building.

## 2. Principles

### 2.1 Reusability

Build for reuse across stores, not one merchant.

| Prefer | Avoid |
|--------|--------|
| Generic section names (`hero-banner`, `text-image`) | Store- or campaign-specific names |
| Neutral default copy (“Heading”, “Shop now”) | Brand slogans in schema defaults |
| Configurable spacing, typography, color schemes | Hardcoded hex, inline styles |
| Modular sections and blocks | Monolithic page-only HTML |

### 2.2 Theme vs apps

| In theme | In apps |
|----------|---------|
| Layout, styling, responsive grids, animations | Subscriptions, reviews, wishlists, loyalty |
| App embed placeholders, stable DOM hooks | Business logic, CRM, advanced search |
| Cart drawer / layout styling | Store locator backends, live chat engines |

Do not rebuild app functionality inside the theme.

### 2.3 Product page (PDP) safety

**Critical:** Subscription apps, variant pickers, dynamic checkout, reviews, and merchandising blocks rely on the **default Bottle PDP / product form DOM**.

- Extend PDP incrementally (settings, classes, surrounding sections).
- Do **not** replace core variant selectors, price nodes, or add-to-cart wrappers.
- Add merchandising as separate sections above/below the product form, or as blocks.

### 2.4 Typography and spacing

Expose typography and spacing through **theme settings** and section schemas where possible. Avoid magic numbers in CSS unless they are design tokens in a shared `public/.../tokens.css` (optional pattern).

### 2.5 Color schemes

Every section a merchant can add must expose a **`color_scheme`** setting so all theme-wide schemes are selectable on that section, and the section must **inherit its colors from the selected scheme** via `--color-*` CSS variables. Never hardcode brand colors in section CSS. See [§8](../craft/color-schemes.md).

### 2.6 Responsive layout via native controls

Use Shopline's native **`style.layout` / `style.spacing` / `style.size`** settings (rendered with `class_list()`) so merchants can adjust flex layout, padding, and dimensions **separately for desktop and mobile** from the customizer. Avoid fixed pixel layout in CSS where a native control can own it. See [§9](../craft/responsive-controls.md).

---

---

## 4. Naming conventions

| Layer | Convention | Example |
|-------|------------|---------|
| Files & folders | **kebab-case** | `announcement-bar.html`, `hero-banner/` |
| Schema setting `id` | **snake_case** | `button_label`, `color_scheme` |
| i18n / `t:` keys | **snake_case** | `t:sections.hero_banner.name` |
| Section-local block `type` | **`$` + kebab-case** | `"$nav-link"`, `"$feature-card"` |

**Wrong:** `announcement_bar.html`, `t:sections.announcement-bar.name`, block type `"nav-link"` without `$` in section-local blocks.

### 4.1 Brand-neutral section & block names (required)

Section folders, file names, schema IDs, block types, and `t:` keys must describe **what the component is/does**, never a specific store, brand, campaign, or person. The same name should make sense if the theme is reused on any unrelated store.

| Use (functional / descriptive) | Avoid (brand- or campaign-specific) |
|--------------------------------|-------------------------------------|
| `hero-banner/`, `header/`, `footer/` | `sunday-hero/`, `acme-header/` |
| `image-with-text/`, `feature-grid/` | `dolce-vita-band/`, `summer-sale-grid/` |
| `testimonial-list/`, `logo-bar/` | `oprah-reviews/`, `vogue-logos/` |
| `newsletter-signup/`, `store-locator/` | `berry-newsletter/`, `find-us-near-you/` |
| block `"$feature-card"`, `"$nav-link"` | block `"$tutti-tile"`, `"$fritto-feature"` |
| `t:sections.hero_banner.name` | `t:sections.sunday_hero.name` |

Rules:

- Name by **role and layout** (`hero-banner`, `media-with-text`, `collection-list`), not by the content a particular merchant happens to put in it.
- **No proper nouns** — store names, product line names, place names, or marketing slogans never appear in folder/file/ID names.
- If you must namespace to avoid collisions with base sections, use a **neutral, theme-level prefix** (e.g. `custom-`, `theme-`), not a brand prefix (e.g. not `sunday-`).
- Keep merchant-specific wording to **content** (preset/`i18n` default strings), which is editable — never bake it into structural names.
- When migrating an existing brand-named theme, **rename brand-prefixed sections** to functional equivalents as part of modularization.

---
