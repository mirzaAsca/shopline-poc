// Create a SHOPLINE custom page (with a theme template attached) via SHOPLINE's
// INTERNAL admin API — the only working way (there is NO public page API; verified).
//
// Endpoint (session-authed): POST /admin/api/site/page/customize
// `templateName` attaches the theme template (e.g. "templates/page.about-us.json").
//
// HOW IT AUTHS: it runs the fetch INSIDE a logged-in admin tab in the isolated Chrome
// (so the browser sends the admin session cookies). Prereq: an isolated Chrome with the
// admin logged in, on CDP port $CDP_PORT (see docs/ops/deploy-publish-validate.md):
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
//     --user-data-dir=/tmp/sl-mirza-profile --remote-debugging-port=9334 \
//     https://<store>/admin   # then log in once
//
// Usage:
//   node scripts/create-page.mjs "<Title>" <handle> [template-suffix] [cdp-port]
//   node scripts/create-page.mjs "About Us" about-us about-us 9334
//   node scripts/create-page.mjs "FAQ" faq                 # default template (page.json)
import process from 'node:process';

const [, , TITLE, HANDLE_ARG, SUFFIX = '', PORT = process.env.CDP_PORT || '9334'] = process.argv;
if (!TITLE || !HANDLE_ARG) { console.error('usage: node create-page.mjs "<Title>" <handle> [template-suffix] [cdp-port]'); process.exit(1); }
const HANDLE = HANDLE_ARG.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
const TEMPLATE = SUFFIX ? `templates/page.${SUFFIX}.json` : 'templates/page.json';

const targets = await (await fetch(`http://localhost:${PORT}/json`)).json();
const tab = targets.find(t => t.type === 'page' && /\/admin/.test(t.url) && /myshopline\.com/.test(t.url)) || targets.find(t => t.type === 'page');
if (!tab) { console.error('No admin tab found on CDP port ' + PORT + '. Launch Chrome + log into the admin first.'); process.exit(1); }

const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0; const pend = new Map();
const send = (m, p = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } };
await new Promise(r => ws.onopen = r);
await send('Runtime.enable');

const payload = {
  name: { default: TITLE }, seoTitle: { default: TITLE }, seoDesc: { default: '' }, seoKeyword: {},
  customizePath: `/pages/${HANDLE}`, templateName: TEMPLATE, templateType: 0, seoTitleV2: TITLE,
  status: 1, publishTime: Date.now(),
  seo: { title: TITLE, desc: '', handleList: [HANDLE] },
  coverResourceId: '', htmlConfig: '', seoStatus: 1, sourcePath: null, handle: HANDLE, customUrl: null, sourceCustomPath: null,
};
const expr = `(async()=>{const r=await fetch('/admin/api/site/page/customize?__trackId__=cli'+Date.now(),{method:'POST',headers:{'content-type':'application/json'},body:${JSON.stringify(JSON.stringify(payload))},credentials:'include'});return JSON.stringify({status:r.status,body:(await r.text()).slice(0,500)});})()`;
const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
const out = r?.result?.value ? JSON.parse(r.result.value) : { error: 'no result' };
let parsed; try { parsed = JSON.parse(out.body); } catch { parsed = null; }
if (parsed?.success) console.log(`✅ created "${TITLE}" -> ${parsed.data?.customizePath} (template ${TEMPLATE}, id ${parsed.data?.id})`);
else console.log('❌ failed:', out.status, out.body);
ws.close();
