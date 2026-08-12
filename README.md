# TravelMate AI

**AI-powered trip planning, redesigned and rebuilt as a production-grade travel product.**

🔗 **Live app:** [https://travel-mate-liart.vercel.app](https://travel-mate-liart.vercel.app)

TravelMate AI turns a destination, a trip length, and a budget into a full, personalized itinerary — real hotels, a day-by-day plan, an interactive map, live weather, a budget estimate that checks itself against what you're willing to spend, and a conversational voice AI assistant you can ask follow-up questions. Trips sync across devices for the signed-in Google account that created them.

---

## Project 


The project started as a functional but bare-bones AI trip planner — a working Gemini-powered itinerary generator wrapped in default Tailwind styling, a destination search box that froze while typing, a single placeholder image per page, no real cross-device data persistence (everything lived in one browser's `localStorage`, with no ownership checks on who could view a trip), and a "copilot" panel that could only run one-shot content actions with no memory between clicks.

Redesign and productionize the entire application to feel like a real, launch-ready travel product — comparable to Airbnb or Google Travel — without losing any of the working AI functionality underneath it: a premium visual design system, real destination photography everywhere, fast and reliable search, a genuinely rich trip page, a true conversational voice AI assistant, verified accessibility and responsiveness, and durable data storage that follows a user across devices — then get it live on a real production URL.

Delivered in five phases plus targeted follow-ups, each scoped and verified independently rather than shipped as one untested pile of changes:
- Built a real OKLCH-based design system (light + dark), replaced the laggy native autocomplete with a debounced, keyboard-navigable destination search backed by the Places API, and wired in a resilient real-image pipeline (Wikimedia Commons → Google Places Photos fallback chain) used everywhere from the homepage hero to hotel cards.
- Rebuilt the trip page into hero carousel, interactive Google Map with day-by-day routing, an Open-Meteo weather widget, a currency-aware budget estimate that checks itself against an optional target budget, AI-generated packing lists/local tips/emergency info, and tabbed hotels/itinerary/restaurant sections.
- Replaced the one-shot content generator with a real conversational AI assistant: streaming Gemini responses, a typing indicator, Web Speech API voice input and multi-language text-to-speech with play/pause/resume/stop and speed/voice controls, and persistent per-trip conversation memory.
- Ran real, tool-verified accessibility (axe-core) and responsive (multi-breakpoint) audits instead of guessing, and fixed every violation found — missing landmarks, insufficient color contrast, missing focus states, and a missing 404 page.
- Migrated trip storage from browser-only `localStorage` to Firestore, bridging the existing Google sign-in into a real Firebase Auth session so security rules could enforce that a trip is only ever readable or writable by the account that created it — giving genuine cross-device sync where there was none before.
- Deployed to Vercel with a connected GitHub repo for continuous deployment, and worked through the full chain of real production configuration this requires: Google Cloud API restrictions and referrer allowlists, OAuth authorized origins, and Firebase Authentication provider setup — debugging each with actual browser network traces rather than trial and error.


A fully live, publicly deployed production application with every feature above working end-to-end, verified by driving the real deployed site rather than assuming it worked: successful Google sign-in, itinerary generation, cross-device Firestore-backed trip sync enforced by security rules, a clean accessibility audit, and zero console errors across the core pages. Along the way, several real bugs were found and fixed through this same verification-first approach — a voice-selector bug where TTS silently ignored the chosen voice, raw API error objects being dumped straight into the UI, and a trip-length validation gap that silently allowed invalid input.

---

## Features

**Homepage & Search**
- Full design system with light/dark support, animated hero, trending destinations, feature highlights, and FAQ
- Debounced, keyboard-navigable destination autocomplete with live thumbnails (no typing lag)
- Route-level page transitions and scroll-reveal animations throughout (Framer Motion)

**Trip Planning**
- Gemini-generated itineraries: hotels, day-by-day plans, ticket pricing, ratings, and images
- Adjustable trip length (up to 30 days) and an optional exact target budget with currency selection
- Friendly, specific error handling (e.g. AI quota limits) instead of raw API error dumps

**Trip Page**
- Hero image carousel sourced from real destination photography
- Interactive Google Map with hotel/day markers, day filtering, and straight-line distance
- Live weather (Open-Meteo) and a currency-converting budget estimate with a within/over-budget verdict
- AI-generated packing checklist (with persistent checkboxes), local tips, emergency info, and best-time-to-visit
- Tabbed hotels / itinerary / restaurant recommendations

**Conversational AI Assistant**
- Real chat thread with streaming replies and a typing indicator, not one-shot actions
- Voice input (Web Speech API) and multi-language text-to-speech with play/pause/resume/stop and adjustable speed/voice
- Persistent per-trip conversation memory

**Accounts & Sync**
- Google sign-in, bridged into Firebase Auth for secure, per-user Firestore access
- Trips sync across devices and browsers for the signed-in account; Firestore security rules enforce that only the creator can read or write a trip

**Quality**
- Real axe-core accessibility audits (not manual guessing) with fixes applied
- Verified responsive layout at mobile/tablet/desktop breakpoints
- Styled 404 page, error boundaries, and empty/loading states throughout

---

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS v4, Framer Motion, Radix UI primitives
- **AI:** Google Gemini (`@google/genai`), called from Vercel serverless functions under `/api` — itinerary generation, trip extras, and the streaming conversational assistant
- **Data & Auth:** Firebase Firestore (trip storage) + Firebase Auth bridged from Google Sign-In (`@react-oauth/google`)
- **Maps & Places:** Google Maps JavaScript API, Google Places API (New)
- **Other APIs:** Open-Meteo (weather, free/no key), Wikimedia Commons (destination imagery, free/no key), open.er-api.com (currency exchange rates, free/no key)
- **Voice:** Browser Web Speech API (`SpeechRecognition` + `speechSynthesis`)
- **Deployment:** Vercel, continuous deployment from GitHub

---

## Getting Started

```bash
git clone <this-repo>
cd ai_trip_plannerr-main
npm install
cp .env.example .env   # then fill in your own keys — see below
npm run dev
```

### Required environment variables

Gemini and the Places "search + photo" lookup run behind serverless functions under `/api`, so their API keys are **server-only** and never shipped to the browser. The Places JS map loader and address autocomplete still run client-side (that's inherent to how the Google Maps JS API works), so a separate, `VITE_`-prefixed Places key stays client-side too — restrict it by HTTP referrer in Google Cloud Console since it's necessarily visible in the page.

**Client (`.env`, `VITE_` prefix — inlined into the browser bundle):**

```txt
VITE_GOOGLE_AUTH_CLIENT_ID=
VITE_GOOGLE_PLACE_API_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

**Server-only (no `VITE_` prefix — set in Vercel's Environment Variables settings, or locally in `.env` for `/api` functions during local dev):**

```txt
GOOGLE_GEMINI_AI_API_KEY=
GOOGLE_PLACE_API_KEY=
```

### Google Cloud & Firebase setup (required for a working deploy)

This app touches enough Google services that getting a fresh environment fully working takes a few real configuration steps beyond just the API keys above:

1. **Enable both "Places API (New)" and "Maps JavaScript API"** on your Google Cloud project — they're separate products from the legacy "Places API" and won't work without being explicitly enabled.
2. **Add your app's origin(s)** (e.g. `http://localhost:5173`, your production domain) to:
   - The Google API key's **Application restrictions** (HTTP referrers) — use the `/*` wildcard form, e.g. `https://your-domain.com/*`
   - The OAuth Client ID's **Authorised JavaScript origins** — the exact origin only, **no path, no trailing slash**
3. **In Firebase Console → Authentication:** click "Get started" if you haven't already, then enable **Google** as a sign-in provider. Under that provider's settings, expand **"Whitelist client IDs from external projects"** and add your `VITE_GOOGLE_AUTH_CLIENT_ID` — this app signs in with its own pre-existing Google OAuth client rather than one Firebase auto-generates, so Firebase won't trust the bridged credential without this.
4. **In Firebase Console → Firestore Database:** create the database (production mode), then publish these security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /trips/{tripId} {
         allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.ownerUid;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerUid;
       }
     }
   }
   ```
5. If deploying to Vercel (or similar), remember environment variables are **per-project** — a new Vercel project won't inherit variables from another one, and changes to them require a redeploy since Vite inlines them at build time, not runtime.

---

## How It Works

1. User signs in with Google (bridged into a Firebase Auth session).
2. User picks a destination, trip length, budget, and travelers on the Create Trip page.
3. The client calls `/api/generate-trip`, a Vercel serverless function that builds the prompt, calls Gemini with the server-only key, and returns the parsed itinerary JSON — hotels, day-by-day plan, pricing, ratings. Gemini's API key never reaches the browser.
4. The trip is saved to Firestore, owned by the signed-in user's UID.
5. The trip page loads real images (via `/api/places-search`, which proxies the Places "text search + photo" lookup), live weather, a Google Map, and a budget estimate, then calls `/api/generate-trip-extras` once to generate packing/tips/restaurants/emergency info (cached back onto the trip so it's only generated once).
6. The Trip Assistant lets the user ask follow-up questions in a real streaming conversation (proxied through `/api/trip-assistant`, which streams the Gemini response back chunk by chunk), with optional voice input/output, and that conversation is persisted to the same trip document.

**Client → serverless proxy → Gemini/Places/Firestore:** the browser never holds a Gemini key, and only holds a Places key scoped to the client-side Maps loader and autocomplete (not the search/photo lookup, which is server-only). See `api/generate-trip.js`, `api/trip-assistant.js`, `api/generate-trip-extras.js`, and `api/places-search.js`, all backed by shared logic in `api/_lib/`.

---

## Ownership Note

All API configuration comes from your own `.env` file. No Google OAuth client, Places key, Gemini key, or Firebase project belonging to anyone else should be hardcoded into the source code.
