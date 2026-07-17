# Onboarding — from zero to your first campaign image

Two minutes. You need **one** API key (fal.ai *or* Google Gemini) and Claude Code.

---

## Fastest: paste this into Claude Code

Claude will figure out what you have, tell you exactly where to get a key if you don't, wire it up, and generate your first image. Copy the block below verbatim:

```text
I want to start generating on-brand product/campaign images using the
nano-banana-campaign workflow (Google's Nano Banana models). Set me up from zero:

1. Ask whether I already have a fal.ai key or a Google Gemini key. If I have
   neither, tell me exactly where to get one, roughly what it costs, and help
   me pick between them.
2. Based on my choice, set up the fastest way to call the models from here:
   - fal.ai  -> add the official fal MCP server, or use the nb.js CLI in this repo.
   - Gemini  -> point me at a Nano Banana MCP or the Google GenAI SDK.
3. Once a key works, generate my first PRODUCT MASTER (from a photo I give you,
   or a text prompt), then make one variation from it to prove consistency.

Go one step at a time, and never print my API key.
```

If you have the `nano-banana-campaign` skill installed (see below), Claude already knows the whole method — the paste just kicks it off.

---

## Or set it up by hand

### 1 · Get a key

| Provider | Get the key at | Env var | Notes |
|---|---|---|---|
| **fal.ai** | <https://fal.ai/dashboard/keys> | `FAL_KEY` | One key → Nano Banana Pro/2/Lite + 1,000+ models. ~$0.08/img on model 2. |
| **Google Gemini** | <https://aistudio.google.com/apikey> | `GEMINI_API_KEY` | Nano Banana direct from Google. Free tier to start; then per Google pricing. |

```bash
export FAL_KEY=…          # or:
export GEMINI_API_KEY=…
```

### 2 · Pick how you call it

**Option A — official fal MCP (recommended, no code).** Every fal model becomes a native Claude tool:

```bash
claude mcp add --transport http fal-ai https://mcp.fal.ai/mcp \
  --header "Authorization: Bearer YOUR_FAL_KEY"
```

Stateless, free (you pay only for the runs you trigger), key sent per-request and never stored. Then just ask Claude to generate or edit an image.

**Option B — the `nb.js` CLI (in this repo).** Transparent and reproducible — it's what made this guide:

```bash
cp -r skills/nano-banana-campaign ~/.claude/skills/   # install the skill for Claude
cd ~/.claude/skills/nano-banana-campaign
node nb.js gen --model 2 --prompt "a single ripe banana, product photo" --out test.png
```

**Option C — Google Gemini key.** No official Google MCP yet; either use the [Google GenAI SDK](https://ai.google.dev/gemini-api/docs) with your `GEMINI_API_KEY`, or add a community Nano Banana MCP (vet it first — it takes your key). Model IDs: Pro `gemini-3-pro-image`, 2 `gemini-3.1-flash-image`, 2 Lite `gemini-3.1-flash-lite-image`.

**Want video too?** [Higgsfield's hosted MCP](https://higgsfield.ai/mcp) (`https://mcp.higgsfield.ai/mcp`, OAuth) adds Nano Banana Pro alongside Sora / Veo / Kling on its credit system.

### 3 · Generate your first master

```bash
# text-to-image master (or use `edit --ref yourphoto.png` to build from a real product)
node nb.js gen  --model 2   --prompt "studio product reference sheet: three views of the SAME bottle…" --aspect 3:2 --out master.png
# then attach it to everything — the world changes, the product stays itself
node nb.js edit --model pro  --ref master.png --aspect 4:5 --out poster.png \
                --prompt "campaign poster, headline exactly: \"SLOW BREW.  FAST MORNINGS.\""
```

That's the whole method: **mint one master, attach it to everything.** See the [main guide](README.md) for the strategy and the [skill](skills/nano-banana-campaign/) for the full reference.
