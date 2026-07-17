// Consistency-first regeneration for the NBPro guide.
// 1) Mint a PRODUCT MASTER (multi-view turnaround) from: current short bottle (shape)
//    + Lite compass-rose output (logo).  2) Regenerate the whole example set FROM the
//    master so the label is identical everywhere.  3) Re-run the bake-off with the master
//    attached to all four models (fair test = rendering, not label invention).
// Run: railway run node /tmp/nbmaster.js   (FAL_KEY injected, never printed)
const fs = require('fs'), path = require('path');
const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('FAL_KEY missing'); process.exit(1); }
const EX = '../examples';
const CMP = '../compare';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const H = { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' };

async function uploadToFal(file, name) {
  const bytes = fs.readFileSync(file);
  const init = await fetch('https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3', {
    method: 'POST', headers: H,
    body: JSON.stringify({ file_name: name, content_type: 'image/png' }),
  });
  if (!init.ok) throw new Error(`initiate ${init.status}: ${(await init.text()).slice(0,200)}`);
  const { upload_url, file_url } = await init.json();
  const put = await fetch(upload_url, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: bytes });
  if (!put.ok) throw new Error(`PUT ${put.status}`);
  return file_url;
}

// Generic queue call. edit=true -> /edit endpoint with image_urls. Returns {url,secs,dims,buf}.
async function call(ep, body, label) {
  const t0 = Date.now();
  const r = await fetch(`https://queue.fal.run/${ep}`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  if (!r.ok) { console.log(`  ${label}: submit ${r.status} ${(await r.text()).slice(0,160)}`); return null; }
  const j = await r.json();
  for (let i = 0; i < 200; i++) {
    await sleep(2000);
    const s = await (await fetch(j.status_url, { headers: H })).json();
    if (s.status === 'COMPLETED') break;
    if (s.status === 'FAILED' || s.error) { console.log(`  ${label}: FAILED ${JSON.stringify(s).slice(0,180)}`); return null; }
  }
  const out = await (await fetch(j.response_url, { headers: H })).json();
  const url = out?.images?.[0]?.url;
  if (!url) { console.log(`  ${label}: no image ${JSON.stringify(out).slice(0,180)}`); return null; }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const im = out.images[0];
  const dims = im.width && im.height ? `${im.width}x${im.height}` : '?';
  return { url, secs, dims, buf };
}

async function save(res, file, label) {
  fs.writeFileSync(file, res.buf);
  console.log(`  ${label.padEnd(16)} ${res.secs.padStart(5)}s  ${res.dims.padStart(10)}  ${(res.buf.length/1e6).toFixed(1)}MB  -> ${path.basename(file)}`);
}

(async () => {
  console.log('== uploading source references ==');
  const shapeUrl = await uploadToFal(`${EX}/01_hero.png`, 'shape.png');       // short bottle shape
  const logoUrl  = await uploadToFal(`${CMP}/poster_lite.png`, 'logo.png');    // compass-rose logo
  console.log('  ok');

  // 1) MASTER — three consistent views of the SAME bottle, compass-rose logo locked in.
  console.log('\n== product master (pro/edit, 3:2) ==');
  const masterRes = await call('fal-ai/nano-banana-pro/edit', {
    image_urls: [shapeUrl, logoUrl], aspect_ratio: '3:2', resolution: '2K',
    output_format: 'png', num_images: 1, seed: 3,
    prompt:
      'A clean studio product reference sheet on a seamless warm bone-and-putty backdrop. ' +
      'Take the EXACT matte-black short apothecary-style cold-brew bottle from the first reference ' +
      'image — same short neck, same rounded shoulders, same squat proportions — and dress it with ' +
      'the compass-rose emblem from the second reference image: a small four-point compass star ' +
      'centered above the wordmark "NORTHBOUND", with "COLD BREW" in small caps beneath. Show THREE ' +
      'views of the SAME identical bottle in one frame, evenly spaced left to right: (1) straight-on ' +
      'front view, (2) three-quarter view, (3) a tight close-up of the label. Even soft studio ' +
      'lighting, subtle contact shadow, no other props, catalog turnaround style. The product must ' +
      'be perfectly consistent across all three views. Crisp, legible compass-rose logo.',
  }, 'master');
  if (!masterRes) { console.error('master failed — abort'); process.exit(1); }
  await save(masterRes, `${EX}/00_master.png`, 'master');
  const masterUrl = await uploadToFal(`${EX}/00_master.png`, 'master.png');

  // 2) DERIVED SET — everything from the master, so the label is identical everywhere.
  console.log('\n== derived set (nano-banana-2/edit, 4:5, master attached) ==');
  const derived = [
    { name: 'hero_v2', prompt:
      'Using the attached product master, render a single editorial hero photograph of this EXACT ' +
      'bottle with its compass-rose "NORTHBOUND" label. Stand it on a warm terracotta stone surface, ' +
      'soft directional morning light from camera-left, shallow depth of field, clean negative space ' +
      'upper-right. Premium warm color grade. Keep the label, logo and bottle shape identical.' },
    { name: 'poster_v2', prompt:
      'Using the attached product master, build a premium campaign poster of this EXACT bottle and its ' +
      'compass-rose "NORTHBOUND" label. Place the bottle lower-center on a warm terracotta studio set. ' +
      'Add a large clean bold modern sans headline across the top reading exactly: ' +
      '"SLOW BREW.  FAST MORNINGS." and a smaller tagline beneath reading exactly: ' +
      '"Cold-pressed for 18 hours." Perfect legible typography, correct spelling, editorial ad layout. ' +
      'Do not change the bottle, logo, or label.' },
    { name: 'kitchen_v2', prompt:
      'Using the attached product master, place this EXACT bottle with its compass-rose "NORTHBOUND" ' +
      'label on a sunlit modern kitchen counter beside a linen napkin and a ceramic cup of iced coffee. ' +
      'Soft morning window light, shallow depth of field, lifestyle editorial, same warm grade. ' +
      'Keep the product identical.' },
    { name: 'gym_v2', prompt:
      'Using the attached product master, place this EXACT bottle with its compass-rose "NORTHBOUND" ' +
      'label on a dark slate gym bench beside a folded charcoal towel. Cool athletic lighting with one ' +
      'warm rim light, condensation on the bottle, energetic premium sports mood. Keep the product identical.' },
  ];
  for (const d of derived) {
    const res = await call('fal-ai/nano-banana-2/edit', {
      image_urls: [masterUrl], aspect_ratio: '4:5', resolution: '2K',
      output_format: 'png', num_images: 1, seed: 11,
      prompt: d.prompt,
    }, d.name);
    if (res) await save(res, `${EX}/${d.name}.png`, d.name);
  }

  // 3) FAIR BAKE-OFF — master attached to all four models, same seed per test.
  console.log('\n== fair bake-off (master attached to every model) ==');
  const MODELS = {
    pro:   { ep: 'fal-ai/nano-banana-pro/edit',    extra: { resolution: '2K' } },
    two:   { ep: 'fal-ai/nano-banana-2/edit',      extra: { resolution: '2K' } },
    lite2: { ep: 'google/nano-banana-2-lite/edit', extra: {} },
    lite:  { ep: 'google/nano-banana-lite/edit',   extra: {} },
  };
  const TESTS = [
    { key: 'poster', seed: 11, prompt:
      'Using the attached product master, build a premium campaign poster of this EXACT matte-black ' +
      'cold-brew bottle and its compass-rose "NORTHBOUND" label. Large clean bold modern sans headline ' +
      'across the top reading exactly: "SLOW BREW.  FAST MORNINGS." and a small tagline beneath reading ' +
      'exactly: "Cold-pressed for 18 hours." Warm terracotta and cream palette, perfect legible ' +
      'typography, editorial ad layout. Do not redesign the label.' },
    { key: 'scene', seed: 21, prompt:
      'Using the attached product master, render an editorial product photograph of this EXACT bottle ' +
      'with its compass-rose "NORTHBOUND" label on a warm terracotta stone surface, soft directional ' +
      'morning light from camera-left, shallow depth of field, condensation beads, a sprig of coffee ' +
      'cherry, premium warm color grade. Keep the product identical.' },
  ];
  for (const t of TESTS) {
    console.log(`  -- ${t.key} (seed ${t.seed}) --`);
    for (const [mk, m] of Object.entries(MODELS)) {
      const res = await call(m.ep, {
        image_urls: [masterUrl], prompt: t.prompt, aspect_ratio: '4:5', output_format: 'png',
        num_images: 1, seed: t.seed, ...m.extra,
      }, `${t.key}/${mk}`);
      if (res) await save(res, `${CMP}/${t.key}_${mk}_v2.png`, `${t.key}/${mk}`);
    }
  }
  console.log('\nALL DONE');
})();
