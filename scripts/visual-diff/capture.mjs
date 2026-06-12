// Capture a full-page screenshot of a URL at a given viewport, scrolling to
// trigger lazy-loaded content first. WHY: visual QA needs both the source and
// the new SHOPLINE page captured identically (same viewport, same scroll) so
// compare.mjs can place them side by side and pixel-diff them.
//
// Usage: node scripts/visual-diff/capture.mjs <url> <label> <desktop|mobile|WIDTHxHEIGHT>
// Output: scripts/visual-diff/out/<label>/<viewport>.png
//
// Requires: npm i -D playwright   (then: npx playwright install chromium)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const [, , url, label = 'capture', viewport = 'desktop'] = process.argv;
if (!url) {
  console.error('usage: node capture.mjs <url> <label> <desktop|mobile|WIDTHxHEIGHT>');
  process.exit(1);
}
const PRESETS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const vp = PRESETS[viewport] ?? (() => { const [w, h] = viewport.split('x').map(Number); return { width: w, height: h || 900 }; })();

const outDir = path.join('scripts', 'visual-diff', 'out', label);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
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
