// Nano Banana Pro (fal-ai/nano-banana-2) example generator for the field guide.
// Run via: railway run node /tmp/nbgen.js   (FAL_KEY injected, never printed)
const fs = require('fs');
const path = require('path');

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('FAL_KEY missing'); process.exit(1); }
const OUT = '/home/john/code/NBPro-campaign-guide/examples';
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function gen({ name, prompt, image_urls, width = 2048, height = 2048, seed }) {
  const edit = Array.isArray(image_urls) && image_urls.length;
  const endpoint = edit ? 'fal-ai/nano-banana-2/edit' : 'fal-ai/nano-banana-2';
  const body = { prompt, num_images: 1, output_format: 'png' };
  if (edit) body.image_urls = image_urls; else body.image_size = { width, height };
  if (seed != null) body.seed = seed;

  process.stdout.write(`\n[${name}] submit (${edit ? 'edit' : 't2i'})… `);
  let res = await fetch(`https://queue.fal.run/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) { console.error(`submit ${res.status}: ${(await res.text()).slice(0, 300)}`); return null; }
  let j = await res.json();
  const statusUrl = j.status_url, responseUrl = j.response_url;
  process.stdout.write('queued… ');

  for (let i = 0; i < 120; i++) {
    await sleep(2500);
    const s = await (await fetch(statusUrl, { headers: { Authorization: `Key ${KEY}` } })).json();
    if (s.status === 'COMPLETED') break;
    if (s.status === 'FAILED' || s.error) { console.error('FAILED', JSON.stringify(s).slice(0, 300)); return null; }
    if (i % 4 === 0) process.stdout.write('.');
  }
  const out = await (await fetch(responseUrl, { headers: { Authorization: `Key ${KEY}` } })).json();
  const url = out?.images?.[0]?.url;
  if (!url) { console.error('no image', JSON.stringify(out).slice(0, 300)); return null; }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const file = path.join(OUT, `${name}.png`);
  fs.writeFileSync(file, buf);
  console.log(`done → ${name}.png (${(buf.length / 1e6).toFixed(1)}MB)`);
  return { url, file };
}

(async () => {
  // 1) HERO — the "master look" (text-to-image), the seed every variation inherits.
  const hero = await gen({
    name: '01_hero',
    seed: 7,
    width: 1600, height: 2000,
    prompt:
      'Professional product photograph of a matte-black cold-brew coffee bottle with a minimal ' +
      'copper-foil label reading "NORTHBOUND", standing on a warm terracotta stone surface. Soft ' +
      'directional morning light from camera-left, shallow depth of field, gentle falloff, clean ' +
      'negative space in the upper right. Premium, editorial, warm color grade. 4:5.',
  });

  // 2) TEXT — the marquee feature: a real campaign poster with legible headline typography.
  await gen({
    name: '02_poster_text',
    seed: 11,
    width: 1600, height: 2000,
    prompt:
      'A premium coffee brand campaign poster, 4:5. Matte-black cold-brew bottle labeled ' +
      '"NORTHBOUND" lower third, warm terracotta and cream palette. Large clean headline set in ' +
      'a bold modern sans across the top reading exactly: "SLOW BREW.  FAST MORNINGS." and a ' +
      'small tagline beneath reading exactly: "Cold-pressed for 18 hours." Perfect legible ' +
      'typography, correct spelling, tasteful kerning, editorial ad layout.',
  });

  // 3) + 4) VARIATIONS — feed the hero back as a reference so the product stays itself
  //     across new contexts. This is the one-photo-to-campaign move.
  if (hero?.url) {
    await gen({
      name: '03_variation_kitchen',
      image_urls: [hero.url],
      prompt:
        'Keep this exact bottle and its "NORTHBOUND" label identical. Place it on a sunlit modern ' +
        'kitchen counter beside a linen napkin and a ceramic cup of iced coffee, soft morning ' +
        'window light, shallow depth of field, lifestyle editorial. Same warm color grade.',
    });
    await gen({
      name: '04_variation_gym',
      image_urls: [hero.url],
      prompt:
        'Keep this exact bottle and its "NORTHBOUND" label identical. Place it on a dark slate ' +
        'gym bench beside a folded charcoal towel, cool athletic lighting with one warm rim light, ' +
        'condensation on the bottle, energetic premium sports-brand mood. Same product, new context.',
    });
  }
  console.log('\nALL DONE');
})();
