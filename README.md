# LISTING — San Francisco Classifieds, Reimagined

> Live marketplace for the city that still moves.

---

## Why Redesign Craigslist?

Craigslist is a canonical piece of internet infrastructure — honest, fast, and unapologetically utilitarian. But after two decades, it shows. The UX is unchanged since 2005, it's hostile to mobile, has zero trust signals, and no voice. It's the last great abandoned design challenge.

LISTING is a full editorial redesign of the San Francisco classifieds experience — keeping the raw honesty of the original (no passwords, no accounts to manage, no friction) but layering on a modern aesthetic, voice interaction, and trust infrastructure.

---

## What We Built

### Design
- **Warm editorial aesthetic** — Playfair Display headlines, DM Mono data labels, cream/terracotta/gold/sage palette
- **Paper-and-ink visual language** — borders as rules, stamps, badges, category color-coding
- **Motion-rich** — ambient broadcast rings in the hero, staggered card reveals, animated waveform indicators, floating icon silhouettes
- **Fully responsive** — mobile-first, works across all screen sizes

### Pages & Features
- **`/`** — Hero with search, category grid, upcoming events pullout, recent listings
- **`/feed`** — Live listings with voice search, category/zone filters, map overlay, grid/row toggle, sort
- **`/feed?q=`** — Homepage search routes to feed with query pre-filled
- **`/events`** — Two-view toggle: calendar view with colored event pills per day, or card grid with interactive price-dot map
- **`/saved`** — User profile (auto-signed in as C. Beaumont), listings + events tabs, heart-to-favorite
- **`/post`** — 4-step voice-assisted posting wizard with power meter and read-aloud review
- **`/listing/[id]`** — Full listing detail view

### Voice (ElevenLabs)
- **Voice search** — tap the mic, speak filters like "bikes in mission under 500" — parsed and applied to the feed with spoken confirmation ("Got it. Showing bikes in Mission under $500.")
- **Read aloud on every card** — speaker icon in card footer plays a natural-language summary via ElevenLabs TTS (ATLAS / ECHO voices)
- **Step narration in post wizard** — each step of the posting flow is announced when you advance
- **Review read-aloud** — "Read aloud" button on step 4 of post speaks the full listing before publishing
- **Audio guide** — persistent button in the header for a city overview welcome script

### Trust & Social
- **Seller trust scores** — color-coded (green/gold/terracotta) with join year and score
- **Verified badges** — in user profile and listing detail
- **Compare listings** — select up to 3 listings to compare side-by-side in a sticky CompareBar with voice comparison narration
- **Favorites** — heart button on every listing and event card, persisted to localStorage

### Data & API
- **`/api/listings`** — Primary data source with fallback chain:
  1. **eBay Browse API** (requires `EBAY_CLIENT_ID` + `EBAY_CLIENT_SECRET` in `.env.local`)
  2. **Craigslist RSS** (SF Bay Area, live)
  3. **Mock data** (always works, q-filtered)
- **`/api/tts`** — ElevenLabs Turbo v2.5 TTS endpoint, two voices: ATLAS (deep male, listings) and ECHO (lighter, filter confirmations)

### Events
- Calendar grid with category-colored pills per day
- Click a day to see the full event detail panel
- Cards + mini SVG price-dot map (green = free/<$15, gold = $15–50, terracotta = $50+)
- Category filters, sort by price/week/month

---

## Setup

```bash
npm install
npm run dev
```

### Optional: eBay API
Add to `.env.local`:
```
EBAY_CLIENT_ID=your_client_id
EBAY_CLIENT_SECRET=your_client_secret
```
Without these, the app falls back to Craigslist RSS or mock data automatically.

### Optional: ElevenLabs TTS
Add to `.env.local`:
```
ELEVENLABS_API_KEY=your_key
```
Without this, the read-aloud and voice features degrade gracefully (no audio but no errors).

---

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **SWR** for data fetching with localStorage cache
- **Web Speech API** for voice search (browser-native, no deps)
- **ElevenLabs Turbo v2.5** for TTS
- **eBay Browse API v1** + **Craigslist RSS** for listings
- **localStorage** for user session and saved items