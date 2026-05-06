# LISTING — San Francisco Classifieds, Reimagined

> Live marketplace for the city that still moves.

---

## Why Craigslist?

Craigslist is honest, fast, and frictionless — but after two decades, the UX is stuck in 2005. No trust signals, no mobile design, no voice, no soul.

We rebuilt it with the soul intact — no passwords, no accounts to manage — but layered on a modern editorial aesthetic, voice interaction, and real trust infrastructure.

## How We Built It

We used **v0 by Vercel** (v0.dev) to generate the initial component structure and accelerate the frontend. From there, we customized everything: the typography, the color palette, the motion system, the interactions. The result is a classifieds experience that feels genuinely designed for the city it's built for.

---

## What We Built

### Design
- **Warm editorial aesthetic** — Playfair Display headlines, DM Mono data labels, cream/terracotta/gold/sage palette inspired by printed matter and city signage
- **Paper-and-ink visual language** — borders as rules, category stamps, trust badges, color-coded sections
- **Motion-rich** — ambient broadcast rings in the hero, staggered card reveals, animated waveform indicators for voice states
- **Fully responsive** — mobile-first throughout

### Pages
- **`/`** — Hero with voice-capable search, category grid, upcoming events, recent listings
- **`/feed`** — Live listings with voice search, category/zone filters, map overlay, grid/row toggle
- **`/events`** — Calendar view (colored pills per day + day detail panel) or card grid with price-dot map
- **`/saved`** — Auto-signed-in user profile with listings/events tabs, heart-to-favorite
- **`/post`** — 4-step voice-assisted posting wizard with power meter and read-aloud review
- **`/listing/[id]`** — Full listing detail

### Voice (ElevenLabs)

Every voice feature works once you add your ElevenLabs API key to `.env.local`:

```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**What voice does across the app:**

1. **Read aloud on every listing** — click the speaker icon on any card (grid or row) to hear the listing read back in a natural voice. Uses ElevenLabs Turbo v2.5, ATLAS voice.

2. **Voice search** — click the mic in the feed filter bar, say something like "bikes in mission under 500" — the app parses your intent, applies the filters, and speaks a confirmation ("Got it. Showing wheels in Mission under $500.")

3. **Posting wizard narration** — as you step through the 4-step post form (Category → Details → Location → Review), the app announces each step via ElevenLabs TTS

4. **Review read-aloud** — on step 4 of posting, a "Read aloud" button speaks your full listing back before you publish

5. **Audio guide** — the speaker icon in the header plays a welcome overview of the app

---

## Making a Post

Go to `/post` — it's a 4-step wizard:
1. **Category** — choose from For Wheels, For Rent, For Sale, For Hire, Free Picks, Sound Kit, Connect, Oddities
2. **Details** — title, price ($0 = free), description
3. **Location** — neighborhood + email + phone
4. **Review** — read it aloud, then publish. Listings go live immediately.

---

## Setup

```bash
npm install
npm run dev
```

**Add your ElevenLabs key** in `.env.local` at the project root:
```
ELEVENLABS_API_KEY=your_key_here
```

Without the key, all voice features degrade gracefully (UI stays functional, audio simply doesn't play). Everything else works with zero configuration — mock data is built in and searchable.

---

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **v0** (v0.dev) for initial component scaffolding
- **SWR** for data fetching
- **Web Speech API** for voice search (browser-native)
- **ElevenLabs Turbo v2.5** for TTS
- **localStorage** for user session and saved items