// Capture a full-page screenshot of a URL at a given viewport, scrolling to
// trigger lazy-loaded content first. WHY: visual QA needs both the source and
// the new SHOPLINE page captured identically (same viewport, same scroll) so
// compare.mjs can place them side by side and pixel-diff them.
//
// Storefront password gate: a fresh browser hitting a SHOPLINE preview sees an
// "Opening soon"/password splash instead of the real page (docs/troubleshooting.md
// says don't anonymous-fetch a gated store). So when the target is a SHOPLINE host
// and STOREFRONT_PASSWORD is set in .env, we submit it first, then re-fetch the page.
//
// Usage: node scripts/visual-diff/capture.mjs <url> <label> <desktop|mobile|WIDTHxHEIGHT>
// Output: scripts/visual-diff/out/<label>/<viewport>.png
//
// Requires: npm i -D playwright   (then: npx playwright install chromium)
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const [, , url, label = 'capture', viewport = 'desktop'] = process.argv;
if (!url) {
  console.error('usage: node capture.mjs <url> <label> <desktop|mobile|WIDTHxHEIGHT>');
  process.exit(1);
}
const PRESETS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const vp = PRESETS[viewport] ?? (() => { const [w, h] = viewport.split('x').map(Number); return { width: w, height: h || 900 }; })();

// Load .env (for the storefront password gate). Falls back to process.env.
const env = { ...process.env };
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = t.match(/^([A-Z_]+)=(?:"([^"]*)"|'([^']*)'|([^\s#]*))/);
    if (m) env[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  }
}
const { STOREFRONT_PASSWORD, SL_STORE, SL_PRIMARY_DOMAIN } = env;

const outDir = path.join('scripts', 'visual-diff', 'out', label);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

// Clear the SHOPLINE storefront password gate if present. Host-gated so we never
// type the password into an unrelated source-site login form.
const isShoplineHost = /\.myshopline\.com/i.test(url)
  || (SL_STORE && url.includes(SL_STORE))
  || (SL_PRIMARY_DOMAIN && url.includes(SL_PRIMARY_DOMAIN));
if (STOREFRONT_PASSWORD && isShoplineHost) {
  const pw = await page.$('input[type="password"]');
  if (pw) {
    await pw.fill(STOREFRONT_PASSWORD);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => {}),
      pw.press('Enter'),
    ]);
    // gate cookie is now set — re-fetch the page we actually want to capture
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  }
}

// scroll through the page so lazy images/sections render, then return to top
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0;
    const step = setInterval(() => {
      window.scrollBy(0, 800); y += 800;
      if (y >= document.body.scrollHeight) { clearInterval(step); resolve(); }
    }, 100);
  });
});
await page.waitForTimeout(500);
await page.evaluate(() => window.scrollTo(0, 0));

const file = path.join(outDir, `${viewport}.png`);
await page.screenshot({ path: file, fullPage: true });
console.log('saved', file);
await browser.close();
