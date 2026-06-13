// GUARDS: the home page's default color scheme (scheme-1) matches the snazzy brand
// tokens — black background, white text, white/black buttons.
// WHY: every section on the page reads its colours from this scheme via --color-*
// variables (docs/craft/color-schemes.md). If scheme-1 drifts, EVERY section recolours
// wrong at once and the strict visual-diff fails everywhere — this catches it at the
// source, cheaply, before any section is built. A future fresh-context loop has no
// memory of why these exact values were chosen; this test is that memory.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('scheme-1 carries the snazzy dark brand tokens', () => {
  const cfg = JSON.parse(readFileSync('theme.config.json', 'utf8'));
  const s = cfg.presets.Default.theme.color_schemes['scheme-1'].settings;
  expect(s.color_background).toBe('#000000');   // source body bg rgb(0,0,0)
  expect(s.color_text).toBe('#FFFFFF');         // source body text rgb(255,255,255)
  expect(s.color_button_background).toBe('#FFFFFF'); // source button white
  expect(s.color_button_text).toBe('#000000');       // source button label black
});
