---
name: nano-banana-campaign
description: Run the one-photo-to-campaign workflow with Google's Nano Banana image models (Pro / 2 / Lite) via the fal.ai queue API. Mint ONE product master, then attach it to every downstream generation so the product stays on-brand across contexts, formats, and languages. Covers the endpoints, pricing, the queue+upload API pattern, the master-first method, prompting patterns, tier selection, and a dependency-free CLI (nb.js) that reduces the whole flow to `gen` and `edit`. Use whenever the user wants consistent product/brand imagery, campaign variations from a hero shot, on-image text/poster rendering, or a Nano Banana tier comparison.
---

# Nano Banana campaign workflow

The single most important rule: **consistency comes from a reference image, not from the model tier.** Mint one master, attach it to everything. A model with a good reference beats a better model with none.

## The endpoints

| Tier | Base endpoint | `/edit` (reference) | Price | Resolution control |
|---|---|---|---|---|
| **Pro** | `fal-ai/nano-banana-pro` | `…/edit` | $0.15/img | `resolution`: 1K / 2K / 4K · `enable_web_search` |
| **2** | `fal-ai/nano-banana-2` | `…/edit` | $0.08/img | `resolution`: 0.5K–4K · `thinking_level` |
| **Lite** | `google/nano-banana-lite` | `…/edit` | $1.00/unit | none (fixed ~1K) |
| **2 Lite** | `google/nano-banana-2-lite` | `…/edit` | $1.00/unit | none — **pixel-identical to Lite** |

- `…-lite` and `…-2-lite` return the same pixels at the same seed. Treat them as one model.
- "Lite" bills per *unit*, not per image — at $1.00 it can cost more than Pro/2. Its only edge is speed (~7s vs ~22–33s). Confirm what a "unit" is before volume use.

## Auth

`FAL_KEY` must be in the environment. Never print it.
- This user keeps it in Railway (project `precious-curiosity`): run any script with `railway run node …` from the `alienrobot-server` repo to inject it.
- Otherwise: `export FAL_KEY=…` (or source it) before running.

## The queue API pattern

Every generation is: **submit → poll `status_url` → fetch `response_url` → `images[0].url`**.

```
POST https://queue.fal.run/<endpoint>        body: {prompt, num_images, output_format, ...}
  -> {status_url, response_url}
GET  <status_url>   (repeat until {status:"COMPLETED"};  bail on FAILED/error)
GET  <response_url> -> {images:[{url,width,height}]}      then GET the image url for bytes
```
Headers on every call: `Authorization: Key $FAL_KEY`. An empty/invalid body still returns 200 (it queues, not validates) — read the final response for `detail` errors like `"Field required: prompt"`.

## Attaching references (image-to-image)

`/edit` endpoints take `image_urls: [ ... ]` (up to 14). Upload local files to fal storage first:
```
POST https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3
     body: {file_name, content_type:"image/png"}   -> {upload_url, file_url}
PUT  <upload_url>   (raw bytes)                      then use file_url in image_urls
```

## The method — master first

1. **Mint the master.** Generate (or edit from source photos) ONE clean product image. A multi-view master — front, three-quarter, and a label close-up in a single frame — gives the model the most to anchor on. Lock the logo/label here.
2. **Derive everything from it.** For each scene/format/localization, call `/edit` with the master in `image_urls` and a prompt that says *"keep this EXACT product/label, do not redesign it,"* changing only the context.
3. **One axis per prompt.** Change context **or** format **or** copy — never all three. Coherent sets, diagnosable failures.
4. **Localize as an edit.** Swap only the headline copy; keep the master attached. Native-speaker review still required — it renders what you give it.
5. **Validate by looking.** Open every output. Watch for subtle drift (a dropped subline, kerning, a changed cap). Re-run the ones that drift.

## Prompting patterns

- **Direct, don't wish:** "85mm, f/2, soft key camera-left, warm 3200K practicals, slight teal shadow grade" — not "make it nice."
- **Name the consistency target:** "Keep this EXACT bottle and its compass-rose 'NORTHBOUND · COLD BREW' label identical. Do not redesign the label."
- **Fixed text goes in quotes, verbatim:** `reading exactly: "SLOW BREW.  FAST MORNINGS."`
- **Reserve web-search grounding (Pro)** for infographics that need live data.

## Tier selection

Draft on **Lite** (speed), produce on **2** (best value — richest photoreal at 2K, half Pro's price), finish on **Pro** when you need 4K, the cleanest layout, or web-search grounding. **Always attach the master, whichever tier you use.**

## The CLI — `nb.js`

Dependency-free (Node 18+, global `fetch`). The whole workflow is two verbs:

```bash
# 1) mint a master (text-to-image, or edit from source photos)
node nb.js gen  --model 2   --prompt "studio product reference sheet: three views…" --aspect 3:2 --out master.png

# 2) derive scenes — attach the master, change only the world
node nb.js edit --model 2   --ref master.png --prompt "…kitchen counter, morning light… keep the product identical" --aspect 4:5 --out kitchen.png
node nb.js edit --model pro --ref master.png --prompt "…poster, headline exactly: \"SLOW BREW.  FAST MORNINGS.\"" --aspect 4:5 --out poster.png

# multi-reference (shape from one, logo from another), up to 14 refs
node nb.js edit --model pro --ref shape.png --ref logo.png --prompt "…" --out newmaster.png

# just upload and get a fal URL
node nb.js upload master.png
```

`--model pro|2|lite|2lite` · `--aspect` e.g. `4:5` · `--res 1K|2K|4K` (Pro/2 only) · `--seed N` · `--ref` repeatable. Writes the PNG, prints its path (timing/dims go to stderr).

**Fair tier bake-off:** run the *same* `edit` (same `--ref master.png`, prompt, `--seed`) across all four `--model` values and montage the outputs. With the master attached the comparison measures rendering, not label invention — every tier should hold the same brand.

## Common failures

- **`Field required: prompt`** — the queue accepted an incomplete body; the error surfaces only in the final response. Check the body.
- **Different label on every output** — you forgot the reference. Attach the master.
- **Subtle drift** (dropped subline, kerning) — expected on any single gen; re-roll or add the missing element explicitly to the prompt.
- **Stale image in a GitHub README** — GitHub's camo proxy caches by URL; if you overwrote a file in place, rename it to force a fresh fetch.
