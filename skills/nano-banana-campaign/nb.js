#!/usr/bin/env node
// nb.js — a tiny, dependency-free CLI for the fal.ai Nano Banana family.
// The whole one-photo-to-campaign workflow reduces to two verbs: `gen` and `edit`.
//
//   FAL_KEY must be in the environment (see the skill's auth note).
//
//   node nb.js gen  --model 2   --prompt "…"                 --out hero.png [--aspect 4:5] [--res 2K] [--seed 7]
//   node nb.js edit --model pro --ref master.png --prompt "…" --out poster.png [--ref logo.png] [--aspect 4:5] [--seed 11]
//   node nb.js upload master.png                              # -> prints the fal file_url
//
// --model: pro | 2 | lite | 2lite   (edit appends /edit automatically)
// --ref can be repeated (up to 14). --res (1K|2K|4K) applies to pro/2 only.
'use strict';
const fs = require('fs');

const EP = { pro: 'fal-ai/nano-banana-pro', '2': 'fal-ai/nano-banana-2',
             lite: 'google/nano-banana-lite', '2lite': 'google/nano-banana-2-lite' };
const KEY = process.env.FAL_KEY;
const H = { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const die = m => { console.error('nb: ' + m); process.exit(1); };

function parseArgs(argv) {
  const a = { _: [], ref: [] };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--ref') a.ref.push(argv[++i]);
    else if (t.startsWith('--')) a[t.slice(2)] = argv[++i];
    else a._.push(t);
  }
  return a;
}

async function uploadToFal(file) {
  const bytes = fs.readFileSync(file);
  const name = file.split('/').pop();
  const init = await fetch('https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3',
    { method: 'POST', headers: H, body: JSON.stringify({ file_name: name, content_type: 'image/png' }) });
  if (!init.ok) die(`upload initiate ${init.status}: ${(await init.text()).slice(0, 200)}`);
  const { upload_url, file_url } = await init.json();
  const put = await fetch(upload_url, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: bytes });
  if (!put.ok) die(`upload PUT ${put.status}`);
  return file_url;
}

// Submit to the queue, poll to completion, return { url, secs, dims, bytes }.
async function submit(endpoint, body) {
  const t0 = Date.now();
  const r = await fetch(`https://queue.fal.run/${endpoint}`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  if (!r.ok) die(`submit ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  for (let i = 0; i < 200; i++) {
    await sleep(2000);
    const s = await (await fetch(j.status_url, { headers: H })).json();
    if (s.status === 'COMPLETED') break;
    if (s.status === 'FAILED' || s.error) die(`generation failed: ${JSON.stringify(s).slice(0, 300)}`);
  }
  const out = await (await fetch(j.response_url, { headers: H })).json();
  const img = out?.images?.[0];
  if (!img?.url) die(`no image in response: ${JSON.stringify(out).slice(0, 300)}`);
  const buf = Buffer.from(await (await fetch(img.url)).arrayBuffer());
  return { url: img.url, secs: ((Date.now() - t0) / 1000).toFixed(1),
           dims: img.width && img.height ? `${img.width}x${img.height}` : '?', buf };
}

async function main() {
  if (!KEY) die('FAL_KEY is not set in the environment.');
  const [cmd, ...rest] = process.argv.slice(2);
  const a = parseArgs(rest);

  if (cmd === 'upload') {
    const f = a._[0]; if (!f) die('usage: nb.js upload <file.png>');
    console.log(await uploadToFal(f));
    return;
  }
  if (cmd !== 'gen' && cmd !== 'edit') die('usage: nb.js <gen|edit|upload> …  (see header)');

  const base = EP[a.model || '2']; if (!base) die(`unknown --model "${a.model}" (pro|2|lite|2lite)`);
  if (!a.prompt) die('--prompt is required');
  if (cmd === 'edit' && a.ref.length === 0) die('edit needs at least one --ref <file.png>');

  const body = { prompt: a.prompt, num_images: 1, output_format: 'png' };
  if (a.aspect) body.aspect_ratio = a.aspect;
  if (a.seed != null) body.seed = Number(a.seed);
  if (a.res && (a.model === 'pro' || a.model === '2' || !a.model)) body.resolution = a.res;

  let endpoint = base;
  if (cmd === 'edit') {
    endpoint = `${base}/edit`;
    process.stderr.write(`uploading ${a.ref.length} reference(s)… `);
    body.image_urls = [];
    for (const f of a.ref) body.image_urls.push(await uploadToFal(f));
    process.stderr.write('ok\n');
  }

  process.stderr.write(`${cmd} via ${endpoint}… `);
  const res = await submit(endpoint, body);
  process.stderr.write(`${res.secs}s  ${res.dims}  ${(res.buf.length / 1e6).toFixed(1)}MB\n`);
  const out = a.out || `nb_${cmd}_${a.model || '2'}.png`;
  fs.writeFileSync(out, res.buf);
  console.log(out);
}

main().catch(e => die(e.message || String(e)));
