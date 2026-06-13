// Pretty-prints claude's `--output-format stream-json --verbose` (NDJSON) into readable,
// COLORED terminal logs for the Ralph loop: assistant text (dim), tool calls (cyan with
// the key arg — file path / command), tool errors (red), and the final result + cost (green).
// Robust: skips non-JSON lines; also handles `--output-format json` (a single result object).
// Used by scripts/ralph.sh:  claude … | tee iter.jsonl | node scripts/ralph-format.mjs
import { createInterface } from 'node:readline';

const C = { off: '\x1b[0m', dim: '\x1b[2m', cyan: '\x1b[36m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m' };
const out = (s) => process.stdout.write(s + '\n');

// one-line summary of a tool call's most useful argument
const arg = (input) => {
  if (!input || typeof input !== 'object') return '';
  const v = input.file_path || input.path || input.command || input.pattern || input.url
    || input.description || (input.prompt && String(input.prompt).slice(0, 60));
  return v ? String(v).replace(/\s+/g, ' ').slice(0, 90) : '';
};

const renderMessage = (m) => {
  if (!m || !Array.isArray(m.content)) return;
  for (const c of m.content) {
    if (c.type === 'text' && c.text && c.text.trim()) {
      out(C.dim + c.text.trim() + C.off);
    } else if (c.type === 'tool_use') {
      out(`  ${C.cyan}🔧 ${c.name}${C.off} ${C.dim}${arg(c.input)}${C.off}`);
    } else if (c.type === 'tool_result' && c.is_error) {
      const t = typeof c.content === 'string' ? c.content : JSON.stringify(c.content);
      out(`  ${C.red}↳ tool error${C.off} ${C.dim}${String(t).replace(/\s+/g, ' ').slice(0, 120)}${C.off}`);
    }
  }
};

createInterface({ input: process.stdin }).on('line', (line) => {
  line = line.trim();
  if (!line) return;
  let o;
  try { o = JSON.parse(line); } catch { return; }   // ignore non-JSON noise
  if (o.type === 'system' && o.subtype === 'init') {
    out(`${C.dim}· session ${(o.session_id || '').slice(0, 8)} · model ${o.model || '?'}${C.off}`);
  } else if (o.type === 'assistant') {
    renderMessage(o.message);
  } else if (o.type === 'user') {
    renderMessage(o.message);                         // surfaces tool errors only
  } else if (o.type === 'result' || o.total_cost_usd != null) {
    const cost = o.total_cost_usd != null ? `$${Number(o.total_cost_usd).toFixed(4)}` : '?';
    const status = o.is_error ? `${C.red}ERROR${C.off}` : `${C.green}ok${C.off}`;
    out(`${C.green}✓ agent done${C.off} · ${status} · ${C.dim}cost ${cost}${C.off}`);
  }
});
