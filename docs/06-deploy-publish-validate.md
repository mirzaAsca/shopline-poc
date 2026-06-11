# 06 — Deploy, Publish & Validate

The release loop: **edit → push → (publish) → validate**.

## 1. Deploy (push)

```bash
# whole theme
sl theme push --theme ${SL_THEME_ID}            # choose "Push all files (overwrite existing ones)"
# surgical
printf '\n' | sl theme push --theme ${SL_THEME_ID} --only <path…>
```
Push prints a **preview URL**: `https://${SL_STORE}/?preview=1&themeId=${SL_THEME_ID}` and a theme-editor URL. Pushing to an **unpublished** theme never affects live visitors.

## 2. Publish (status swap) — the `-p` flag does NOT work

`sl theme push -p` is a no-op ([08](08-troubleshooting.md#publish-flag-is-a-no-op)). Record the current live theme first, then swap:

```bash
sl theme list | grep live        # note the current live id for rollback
node -e "require('$(npm root -g)/@shoplineos/cli/dist/services/theme/api.js')\
.changeThemeStatus({themeId:'${SL_THEME_ID}', status:1})\
.then(()=>console.log('published')).catch(e=>{console.error(e.message);process.exit(1)})"
sl theme list                    # confirm [live] moved; old theme is now [unpublished] (reversible)
```

## 3. Validate — isolated Chrome + CDP (does not disturb other browsers)

The repo/agent environment may already run a Chrome under a profile locked by another tool (e.g. a `chrome-devtools` MCP). **Launch a separate, isolated Chrome** with its own profile + debug port — fully independent.

### Launch

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir="${CDP_PROFILE}" \
  --remote-debugging-port="${CDP_PORT}" \
  --no-first-run --no-default-browser-check \
  "https://${SL_STORE}/?preview=1&themeId=${SL_THEME_ID}" \
  >/tmp/sl-chrome.log 2>&1 &
```
- Linux: binary is `google-chrome` / `chromium`.
- This process is independent of any other Chrome profile; verify with
  `ps aux | grep -o 'user-data-dir=[^ ]*' | sort -u`.

### Drive it via CDP (no MCP needed)

Node 22's global `WebSocket` speaks CDP directly. Pattern: GET `http://localhost:${CDP_PORT}/json` → take a `page` target's `webSocketDebuggerUrl` → send `Page.enable` / `Runtime.evaluate` / `Page.captureScreenshot`.

Minimal screenshot helper:
```js
// node cdp-shot.mjs <port> <outfile>
const [,, port='9333', out='/tmp/shot.png'] = process.argv;
const t = (await (await fetch(`http://localhost:${port}/json`)).json()).find(x=>x.type==='page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id=0; const p=new Map();
const send=(m,q={})=>new Promise(r=>{const i=++id;p.set(i,r);ws.send(JSON.stringify({id:i,method:m,params:q}));});
ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&p.has(m.id)){p.get(m.id)(m.result);p.delete(m.id);}};
await new Promise(r=>ws.onopen=r);
await send('Page.enable');
const {data}=await send('Page.captureScreenshot',{format:'png'});
(await import('fs')).writeFileSync(out, Buffer.from(data,'base64'));
ws.close();
```
Useful CDP calls: `Page.navigate {url}`, `Runtime.evaluate {expression,returnByValue:true,awaitPromise:true}` (read DOM text, scroll, fill inputs), `Page.captureScreenshot {format,captureBeyondViewport:true}`.

### Password gate

If the store is password-protected, the storefront/preview redirects to a password page. Either:
- pass `${STOREFRONT_PASSWORD}` programmatically (find `input[type=password]`, set value, submit the form via `Runtime.evaluate`), or
- have a human enter it once in the isolated window (the profile persists the cookie).

After the gate, navigate to the page under test and assert on DOM text:
```js
// in the page context
(document.body.innerText||'').includes('<expected unique string>')
```
A **page record** must exist for `/pages/<handle>` or it returns "404 page not found" ([05](05-pages-and-templates.md)).

### Cleanup
Close the window or `rm -rf ${CDP_PROFILE}` to drop the cached admin/storefront session.

## Validation checklist (per migrated page)

- [ ] Template pushed and round-trip-verified
- [ ] Page record exists (correct `template_suffix`)
- [ ] Storefront route renders (no 404) past the password gate
- [ ] Expected unique content string present in DOM
- [ ] Screenshot captured for the report
