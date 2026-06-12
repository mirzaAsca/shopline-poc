// Create a SHOPLINE blog and/or blog article via the PUBLIC Admin REST API.
// Verified 2026-06-12 on mirza-asca. Auth = Bearer app token (SL_TOKEN in .env).
// Unlike custom pages, blogs/articles ARE in the public Admin API.
//
//   Blog:    POST /admin/openapi/{ver}/store/blogs.json            {"blog":{"title","handle"}}
//   Article: POST /admin/openapi/{ver}/store/blogs/{id}/articles.json
//            {"blog":{"title","content_html","handle","published":true}}   ← note the "blog" wrapper
//
// Usage:
//   node scripts/create-blog.mjs blog "<Title>" <handle>
//   node scripts/create-blog.mjs article <blogId> "<Title>" <handle> "<html body>"
import { readFileSync } from 'node:fs';
const env = {};
for (const l of readFileSync('.env', 'utf8').split('\n')) { const t = l.trim(); if (!t || t.startsWith('#')) continue; const m = t.match(/^([A-Z_]+)=(?:"([^"]*)"|'([^']*)'|([^\s#]*))/); if (m) env[m[1]] = m[2] ?? m[3] ?? m[4] ?? ''; }
const { SL_STORE, SL_API_VERSION, SL_TOKEN } = env;
const base = `https://${SL_STORE}/admin/openapi/${SL_API_VERSION}`;
const H = { 'Authorization': `Bearer ${SL_TOKEN}`, 'Content-Type': 'application/json; charset=utf-8' };
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9-]+/g, '-');

const [, , kind, ...rest] = process.argv;
if (kind === 'blog') {
  const [title, handle] = rest;
  if (!title) { console.error('usage: create-blog.mjs blog "<Title>" <handle>'); process.exit(1); }
  const r = await fetch(`${base}/store/blogs.json`, { method: 'POST', headers: H, body: JSON.stringify({ blog: { title, handle: handle ? slug(handle) : slug(title) } }) });
  const b = await r.text(); const id = (() => { try { return JSON.parse(b)?.blog?.id; } catch { return null; } })();
  console.log(r.status === 200 && id ? `✅ blog created: "${title}" id=${id}` : `❌ ${r.status} ${b.slice(0, 200)}`);
} else if (kind === 'article') {
  const [blogId, title, handle, html = ''] = rest;
  if (!blogId || !title) { console.error('usage: create-blog.mjs article <blogId> "<Title>" <handle> "<html>"'); process.exit(1); }
  const r = await fetch(`${base}/store/blogs/${blogId}/articles.json`, { method: 'POST', headers: H, body: JSON.stringify({ blog: { title, content_html: html, handle: handle ? slug(handle) : slug(title), published: true } }) });
  const b = await r.text(); const id = (() => { try { return JSON.parse(b)?.blog?.id; } catch { return null; } })();
  console.log(r.status === 200 && id ? `✅ article created in blog ${blogId}: "${title}" id=${id}` : `❌ ${r.status} ${b.slice(0, 200)}`);
} else {
  console.error('usage:\n  create-blog.mjs blog "<Title>" <handle>\n  create-blog.mjs article <blogId> "<Title>" <handle> "<html>"');
  process.exit(1);
}
