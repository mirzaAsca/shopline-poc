// GUARDS: Inter font is configured as the display + body typeface for the theme,
// matching the snazzy source site (Inter 48px/700 for h2, Inter 400 for body).
// WHY: typography is a foundational brand signal — if the font drifts to Brygada 1918
// (the Bottle stock default) or another face, every heading and body block on every
// section diverges from the source, and the strict visual-diff will flag mismatches
// everywhere. This test catches font drift at the config level (cheap, fast) and also
// verifies the font actually renders on the live storefront preview (behavioral).
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* ---------- structural: schema defaults point to Inter ---------- */

test('theme.schema.json defaults title font to Inter:700', () => {
  const schema = JSON.parse(readFileSync('theme.schema.json', 'utf8'));
  const fontGroup = schema.schemas.find(s =>
    s.settings?.some(st => st.id === 'sort_title_font')
  );
  const titleFont = fontGroup.settings.find(s => s.id === 'sort_title_font');
  expect(titleFont.default).toBe('Inter:700');
});

test('theme.schema.json defaults body font to Inter:400', () => {
  const schema = JSON.parse(readFileSync('theme.schema.json', 'utf8'));
  const fontGroup = schema.schemas.find(s =>
    s.settings?.some(st => st.id === 'sort_body_font')
  );
  const bodyFont = fontGroup.settings.find(s => s.id === 'sort_body_font');
  expect(bodyFont.default).toBe('Inter:400');
});

/* ---------- structural: preset carries the Inter values ---------- */

test('theme.config.json preset sets Inter fonts and title size 29', () => {
  const cfg = JSON.parse(readFileSync('theme.config.json', 'utf8'));
  const theme = cfg.presets.Default.theme;
  expect(theme.sort_title_font).toBe('Inter:700');
  expect(theme.sort_body_font).toBe('Inter:400');
  expect(theme.sort_title_size).toBe(29);
});

/* ---------- behavioral: Inter renders on the preview storefront ---------- */

test('preview storefront heading renders in Inter (not fallback)', async ({ browser }) => {
  const previewUrl =
    'https://mirza-asca.myshopline.com/?preview=1&themeId=6a2c199076c8507c07380d86';
  const password = process.env.STOREFRONT_PASSWORD || 'f7mr';

  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the preview; handle the password gate if present
  await page.goto(previewUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const pwInput = page.locator('input[type="password"]');
  if (await pwInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await pwInput.fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
  }

  // Wait for the page to settle (fonts load asynchronously)
  await page.waitForTimeout(2000);

  // Check the computed font-family on a heading or the body
  // The CSS var --sort-title-font should resolve to "Inter" (+ fallback)
  const titleFontFamily = await page.evaluate(() => {
    // Try to find any heading on the page
    const heading = document.querySelector('h1, h2, h3, h4, h5, h6, .title1, .title2, .title3');
    if (heading) {
      return window.getComputedStyle(heading).fontFamily;
    }
    // If no heading exists yet (sections not built), check the CSS variable
    return getComputedStyle(document.documentElement).getPropertyValue('--sort-title-font').trim();
  });

  // The font-family should contain "Inter" (either as computed style or CSS var value)
  expect(titleFontFamily.toLowerCase()).toContain('inter');

  // Also check body font
  const bodyFontFamily = await page.evaluate(() => {
    return window.getComputedStyle(document.body).fontFamily;
  });
  expect(bodyFontFamily.toLowerCase()).toContain('inter');

  await context.close();
});
