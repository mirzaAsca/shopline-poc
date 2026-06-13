# 01 — Page: Home (single-page unit)

## 1. Header
- **Source:** https://www.snazzybeverages.com/ · **Mode:** `1:1` (pixel-close) · **Scope:** `page` (this one page) · **Target:** `${SL_STORE}` / theme `${SL_THEME_ID}`.
- **Locales:** `en` (source has no `lang`/locale switching → single locale).
- **Generated:** by `/plan-migration https://www.snazzybeverages.com/ 1:1 --page`, 2026-06-13.
- **Route parity:** N/A for a `--page` unit — covers only the home route (`/`, `index.json`). The `/products` collection page is a **separate follow-up unit** (see Decision log).

## 2. Purpose / big picture
A pixel-close replica of the **snazzy home page** on Bottle: a dark, art-deco brand (black bg, white text, gold accent, Inter display type) with a video hero, a product promo, an image+text band, a partner-logo row, and a "find near you" CTA — plus the **21+ age-gate** overlay rebuilt natively. Observable via the live preview with the **strict** desktop+mobile visual-diff passing (overlays included; the Klaviyo email popup is an app and excluded). Backing **products + collection** are created so the promo's "view all → /products" is real.

## 3. Phases

### Phase 0 — Foundation (only what this page needs)
- [x] **Color schemes from brand tokens** → `theme.config.json`
      Goal: a dark scheme matching source — `color_background` #000, `color_text` #fff, `color_button_background` #fff, `color_button_text` #000, plus a **gold accent** var for the art-deco line/frame.
      References: `docs/craft/color-schemes.md`; source brand tokens (bg `rgb(0,0,0)`, text `rgb(255,255,255)`, button white/black, gold pattern).
      Steps: add scheme(s) under `theme.color_schemes`; keep one key-set across schemes; wire `components/theme-css-var.html` if a new var (gold) is added.
      Acceptance: schemes selectable on every section below.
      Tests:
        - [x] tests/home-foundation.test.js — guards scheme-1 = snazzy dark tokens (#000/#fff, white/black buttons). Gold is image-borne (line-pattern/logo SVG) → no scheme var added.
- [ ] **Typography: Inter** (display + body) → `font`/`layout`
      Goal: load Inter; display headings ~48px/700, body system stack fallback as source.
      References: `docs/craft/assets-and-fonts.md` (@font-face via component + `asset_url()`); source h2 = `Inter 48px/700`.
      Acceptance: headings render in Inter at desktop + mobile.
      Tests:
        - [ ] tests/home-typography.test.js — guards Inter is applied to display headings (no fallback FOUT in the diff).

### Phase 1 — Sections (one task per source block; brand-neutral, modular)
- [ ] **`age-gate`** — full-screen 21+ entry overlay (rebuilt native)
      Goal: dark overlay w/ gold art-deco diamond bg, centered logo, "ARE YOU AT LEAST 21 YEARS OF AGE?", legal copy, white **ENTER WEBSITE** button, Terms link.
      References: `docs/craft/*` (color_scheme + responsive); source: mobile overlay capture.
      Acceptance: side-by-side visual-diff **strict** at desktop+mobile.
      Tests:
        - [ ] tests/age-gate.test.js — renders, has color_scheme + presets + i18n; button dismisses the overlay.
- [ ] **`header`** — logo + primary nav (group)
      Goal: transparent-over-hero sticky header; SNAZZY logo; nav (Shop Now ▾, The Vibe, Where to Buy, Swag, About, Contact) + cart; mobile burger.
      References: `docs/ops/theme-architecture.md` (header group); `docs/craft/responsive-controls.md`; source nav links.
      Acceptance: matches source desktop+mobile (burger on mobile).
      Tests:
        - [ ] tests/header.test.js — nav items + links present; mobile menu toggles; heading outline sane.
- [ ] **`video-hero`** — background-video hero with logo + product cans
      Goal: full-height hero, looping background video (play/pause control), centered SNAZZY mark, product cans.
      References: `docs/craft/*`; `docs/runbooks/scrape-assets.md` (video); source `section_header13`.
      Acceptance: strict visual-diff desktop+mobile; video plays/loops; poster fallback if video can't be hosted.
      Tests:
        - [ ] tests/video-hero.test.js — renders, has color_scheme + responsive controls + presets; video element + poster present.
- [ ] **`image-with-text` (canned cocktails promo)** — promo image + "view all" button
      Goal: faithful promo — `all-cocktails.png` + heading "canned cocktails" + white button → `/products`.
      References: source `section_layout1`; `docs/craft/components-sections-blocks.md`.
      Acceptance: strict visual-diff; button links to `/products`.
      Tests:
        - [ ] tests/promo-canned-cocktails.test.js — renders, image resolves under public/images, button href = /products.
- [ ] **`divider`** — gold art-deco line break (reusable)
      Goal: thin full-width gold line-pattern divider (`snazzy-line-pattern`); reused 3× between bands.
      References: source `section_layout_break`.
      Acceptance: matches the source breaks.
      Tests:
        - [ ] tests/divider.test.js — renders; pattern image resolves; reusable across sections.
- [ ] **`image-with-text` (strong drinks. strong vibes.)** — image + text band
      Goal: heading "strong drinks. strong vibes." + body + product photo (`cans_4104.JPG`).
      References: source `section_layout192`.
      Acceptance: strict visual-diff desktop+mobile (stacks on mobile).
      Tests:
        - [ ] tests/band-strong-vibes.test.js — renders, color_scheme + responsive controls; image resolves.
- [ ] **`logo-bar` (support the vibe)** — partner/charity logo row
      Goal: heading "support the vibe" + logo row (JED, WWP, NAMI, …) as repeatable blocks.
      References: source `section_logo4`.
      Acceptance: strict visual-diff; logos resolve.
      Tests:
        - [ ] tests/logo-bar.test.js — renders, `$`-prefixed logo blocks, presets/i18n, no broken images.
- [ ] **`locator-cta` (find snazzy near you)** — native "where to buy" CTA
      Goal: rebuild the locator CTA section natively (heading + CTA → /where-to-buy). The live liquorpilot locator is an **app** to embed later (stable hook left in place).
      References: source `section_cta26`; `docs/principles/implementation-principles.md` (theme-vs-apps).
      Acceptance: strict visual-diff of the CTA band; app mount-point present.
      Tests:
        - [ ] tests/locator-cta.test.js — renders, CTA link valid, app hook present.
- [ ] **`footer`** — footer nav + brand (group)
      Goal: footer with nav (products, the vibe, where to buy, swag, about, contact), logo, legal.
      References: `docs/ops/theme-architecture.md` (footer group); source footer links.
      Acceptance: matches source; heading outline correct.
      Tests:
        - [ ] tests/footer.test.js — links present, outline (no skipped heading levels).

### Phase 2 — Page, commerce, i18n, SEO (this page)
- [ ] **Compose the home template** (`templates/index.json`) from the sections above, in source order (gate → header → hero → promo → divider → band → divider → logo-bar → divider → locator → footer).
      Acceptance: preview renders all sections in order.
      Tests:
        - [ ] tests/home-render.test.js — `/` loads (no 404), no console errors, all sections present in order.
- [ ] **Commerce — create products + collection** *(scope deviation, per interview — see Decision log)*
      Goal: create the 5 products (Rum/Vodka/Tequila/Whiskey Half & Half, Variety 8-Pack) + a "canned cocktails" collection so `/products` is real.
      References: `docs/ops/content-and-routes.md` (products/collections via public `productCreate`/`collectionCreate`, Bearer token); `docs/ops/create-blogs.md` pattern.
      Acceptance: products + collection exist; `/products` resolves.
      Tests:
        - [ ] tests/commerce-records.test.js — the collection + ≥1 product exist and render; the promo button reaches a live collection.
- [ ] **i18n + SEO for this page**
      Goal: `i18n/en.json` strings for the sections; preserve title "Snazzy Beverages" + the source meta description; home handle.
      References: `docs/craft/schemas-and-i18n.md`.
      Acceptance: title/description present; strings editable.
      Tests:
        - [ ] tests/home-seo.test.js — title + meta description match source; no hardcoded copy in structure.

> No store menus / redirects / other-route records — out of scope for a `--page` unit.

### Phase 3 — QA (this page, STRICT bar)
- [ ] **Deploy** the theme to `${SL_THEME_ID}` and create the records, then publish to a preview state.
- [ ] **Side-by-side visual-diff (desktop + mobile), STRICT** for the home page — score ≤ threshold **and** agent review; **include the rebuilt age-gate overlay**. The Klaviyo email popup is an app → excluded (re-added post-migration).
- [ ] **On any mismatch → diagnose, don't guess:** run `inspect.mjs` → fix-list → loop until it matches.
      Tests:
        - [ ] tests/home-visual.test.js — drives the visual-qa harness; asserts pixel-diff ≤ threshold at desktop + mobile.

## 4. Assets register (provided-first; here = scrape from source)
| Asset | Source URL (Webflow/partner CDN) | In public/images? | Action | Final path |
|---|---|---|---|---|
| SNAZZY primary logo | `…/66ffc1aa…snazzy-logo-primary.svg` | no | scrape | `public/images/snazzy-logo-primary.svg` |
| SNAZZY wide logo | `…/66ffbdfc…Logo-wide.svg` | no | scrape | `public/images/snazzy-logo-wide.svg` |
| Hero background video | (from `section_header13`) | no | scrape (or poster fallback) | `public/images/hero.*` |
| Product lineup | `…/66ffd10a…all-cocktails.png` | no | scrape | `public/images/all-cocktails.png` |
| Product photo | `…/675d39f2…cans_4104.JPG` | no | scrape | `public/images/cans-4104.jpg` |
| Gold line pattern | `…/675d3e7a…snazzy-line-pattern…` | no | scrape | `public/images/line-pattern.svg` |
| Partner logos (JED, WWP, NAMI, +1) | `…/66ffd613…` ×4 | no | scrape | `public/images/partner-*.png` |
| Locator/footer logo | `cdn.liquorpilot.com/…/logo-alt-white.png` | no | scrape | `public/images/locator-logo.png` |

## 5. Decision log
- 2026-06-13 — **Single-page unit (`--page`)**: only the home route in scope; route-parity rule not applied; the `/products` collection *page* is a separate follow-up unit.
- 2026-06-13 — **Commerce pulled into scope** (interview: "build real collection now"), overriding the v1 "commerce deferred" default — create products + collection so `/products` is real. Theme stays modular.
- 2026-06-13 — **Overlays**: rebuild the **age-gate** natively and match it **strictly** (done-bar). The **Klaviyo email popup is an app** → excluded from the theme diff (can't theme-pixel-match an app embed); re-added post-migration.
- 2026-06-13 — **Store-locator** ("find near you") rebuilt as a native CTA band; the live **liquorpilot** widget is an app embedded later via a stable hook.
- 2026-06-13 — **Assets scraped** from the Webflow/partner CDNs into `public/images` (nothing provided).
- 2026-06-13 — **Foundation built:** repurposed **scheme-1** as the snazzy dark default (`#000`/`#fff`, white/black buttons); scheme-4 was already near-dark. **Gold accent is image-borne** (line-pattern + logo SVGs) → no scheme color var added; revisit only if a gold CSS color surfaces. Deployed `theme.config.json` to Bottle1 [unpublished].

## 6. Validation / QA
"Done = identical to source" proven by the merged original|new images for the home page at **desktop + mobile** (strict, overlays incl. age-gate), the pixel-diff scores, and the passing `tests/` above. On mismatch, `inspect.mjs` produces the exact element/property fix-list.
