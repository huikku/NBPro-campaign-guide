# Nano Banana Pro: The Creative Team's Field Guide

### Turn one product photo into a full campaign — without another production cycle

---

## What This Actually Is

Nano Banana Pro is Google's professional image generation and editing model, built on Gemini 3 Pro Image. The original Nano Banana (Gemini 2.5 Flash Image) went viral for creative edits but stumbled on the fundamentals — legible text, high resolution, brand consistency. The Pro release fixes exactly the things that kept it out of professional pipelines.

The short version: it's the first image model that behaves less like a toy and more like a junior production artist who never sleeps.

**The core capabilities that matter for teams:**

- **Up to 14 reference images per prompt** — feed it your product shots, brand assets, style frames, and packaging, and it holds all of them in mind at once
- **Character/subject consistency across up to 5 identities** — your mascot, spokesperson, or hero product stays recognizably itself across an entire campaign
- **1K, 2K, and 4K output** — print-ready resolution, not just social-sized thumbnails
- **Accurate multilingual text rendering** — taglines, packaging copy, and poster text that's actually spelled correctly, in scripts including CJK, Arabic, and Devanagari
- **Search grounding** — pull live data into infographics instead of hardcoding last quarter's numbers
- **Pro-level scene controls** — camera angle, lighting, depth of field, focus, and color grading via natural language

---

## Part 1: The One-Photo-to-Campaign Workflow

This is the workflow behind "one product photo → 47 variations in 12 minutes." Here's how to run it for real.

### Step 1: Build your reference kit

Before you generate anything, assemble your inputs:

1. **Hero product shot** — your cleanest, best-lit photo of the actual product
2. **Brand assets** — logo files, brand color swatches (literally a swatch image works), one or two existing on-brand ads
3. **Style targets** — a mood frame or two showing the lighting/composition style you want

You can attach up to 14 of these in a single prompt. More references = tighter brand adherence. This is the single biggest lever for quality.

### Step 2: Lock the master look

Generate one "north star" image first and iterate until it's right:

> *"Using the attached product photo and brand assets: place the product on a warm terracotta surface, soft directional morning light from camera-left, shallow depth of field, negative space upper-right for headline text. Match the color grade of the attached style frame. 4K, 4:5 aspect ratio."*

Don't rush this step. Every downstream variation inherits the quality of your master.

### Step 3: Branch into variations

Once the master is approved, generate systematically along axes:

- **Context**: kitchen counter / gym bag / office desk / beach towel / holiday table
- **Format**: 1:1 feed post, 4:5 portrait, 9:16 story, 16:9 banner, 2:3 print
- **Season/campaign**: summer palette, holiday styling, back-to-school
- **Audience**: minimal-premium vs. bold-value vs. playful-Gen-Z treatments

Keep the reference images attached in every prompt. That's what keeps variation #47 looking like the same brand as variation #1.

### Step 4: Localize

Because text rendering is now genuinely reliable, localization becomes a prompt edit, not a reshoot:

> *"Same image, replace the headline with: [Japanese tagline]. Keep typography weight and placement identical."*

Run it per market. Have a native speaker verify copy — the model renders text accurately, but it renders *what you give it*, so garbage-in still applies.

---

## Part 2: Playbooks by Role

### Photographers
Your shoot is no longer the deliverable — it's the *seed*. Shoot fewer, better hero frames with clean lighting and full product coverage (front, three-quarter, detail). Then deliver hundreds of contextual variations generated from those masters. Price accordingly: you're selling a variation-ready asset library now, not a folder of JPEGs.

### Designers
Use it as a real-time concepting engine in client calls. "What if the background were darker? What if we tried it horizontal? What about a lifestyle context?" — answered in 15 seconds instead of "we'll get back to you Thursday." Use the camera/lighting/color-grade controls to art-direct with the vocabulary you already have.

### Marketing teams
A/B testing stops being gated by creative production. Generate 10 headline treatments, 5 background contexts, 3 color stories — and let the data decide. Pair with search grounding to build infographics that reflect current numbers rather than whatever was true when the deck was made.

### Ecommerce brands
Every SKU, every market, every season. Generate localized lifestyle imagery per region (correct language on packaging and overlays), seasonal refreshes without reshoots, and marketplace-specific crops at 4K so nothing gets rejected for resolution.

---

## Part 3: Prompting Patterns That Work

**Be a director, not a wisher.** Instead of "make it look nice," specify: *"85mm look, f/2 depth of field, soft key from camera-left, warm 3200K practicals in background, slight teal shadow grade."* The model understands cinematography language — use it.

**Iterate with edits, not regenerations.** Once an image is close, ask for surgical changes: *"Keep everything identical, only change the label text to X"* or *"Same composition, shift the palette toward the attached swatch."* This preserves what's working.

**One axis of change per prompt.** When building variation sets, change context OR format OR copy — not all three at once. It keeps the set coherent and makes failures easy to diagnose.

**Name your consistency targets.** When maintaining characters or products across images, explicitly say so: *"Maintain the exact same model's face and the exact product from the reference images."*

**Use thinking mode for complex compositions.** Multi-subject scenes, dense infographics, and layout-heavy work benefit from it; simple variations don't need it.

---

## Part 4: Honest Limitations (Read Before You Promise a Client Anything)

- **It's a variation engine, not a truth engine.** Product details can drift subtly — label kerning, port placement, stitch patterns. For regulated categories or anything with legal claims on-pack, human QC every image before it ships.
- **Native-speaker review is still mandatory** for localized copy. Accurate rendering ≠ accurate translation.
- **Rights and disclosure**: know your org's policy on AI-generated imagery, model likeness usage, and platform disclosure requirements before publishing. Some ad platforms and retail partners have their own rules.
- **It amplifies your taste; it doesn't supply it.** Teams with a strong art director get 10x output. Teams without one get 10x mediocrity, faster.

---

## Part 5: Getting Started This Week

**Day 1:** Pick one product. Assemble a 10–14 image reference kit. Generate a master.

**Day 2:** Build a 20-variation set across contexts and formats. Note which prompts produced keepers — those become your team's prompt library.

**Day 3:** Localize your top 3 variations into your two biggest non-English markets. Get them reviewed.

**Day 4:** Run a small paid A/B test with the variation set against your current creative.

**Day 5:** Review the data, document the workflow, and train the rest of the team on the prompt library.

The teams that win with this won't be the ones who generate the most images. They'll be the ones who build the tightest *system* — reference kits, prompt libraries, QC checklists — around it.

Don't be most teams.