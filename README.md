# TravelMate_AI

**Created and customized as a personal GenAI portfolio project**

TravelMate_AI is a GenAI-powered travel assistant for itinerary generation, multilingual content creation, operational travel workflows, and voice-based trip guidance. It uses Gemini AI to create personalized travel plans and Copilot-style outputs such as summaries, packing lists, travel blogs, social captions, and trip operations checklists.

## Features
- AI-powered trip planning and recommendations using Gemini
- Multilingual content generation for European and Indian languages
- Text-to-Speech itinerary narration with language-specific voice codes
- Copilot tools for summaries, packing lists, travel blogs, captions, and operations checklists
- Google login, Google Places autocomplete, and destination photo discovery
- Local browser trip storage and saved-trip management with no paid database required
- Built with React, Vite, Tailwind CSS, Firebase, Gemini, and Google APIs

## GenAI Workflow
1. User selects destination, days, budget, and traveler type.
2. Gemini generates a structured JSON itinerary.
3. The trip is saved in browser localStorage.
4. The trip detail page displays hotels and daily places to visit.
5. The GenAI Copilot panel creates multilingual content and speech-ready travel guidance.
6. Browser Text-to-Speech reads generated content aloud in the selected language.

## Supported Voice Languages
English, German, French, Spanish, Italian, Portuguese, Hindi, Tamil, Telugu, Malayalam, Kannada, and Marathi.

## Getting Started
1. Clone the repository
2. Create a `.env` file from `.env.example`
3. Add your own Google OAuth, Google Places, and Gemini API keys
4. Install dependencies: `npm install`
5. Start the development server: `npm run dev`

## Required Environment Variables
```txt
VITE_GOOGLE_AUTH_CLIENT_ID=
VITE_GOOGLE_PLACE_API_KEY=
VITE_GOOGLE_GEMINI_AI_API_KEY=
```

## Ownership Note
All API configuration must come from your own `.env` file. No Google OAuth client, Places key, or Gemini key from another person should be hardcoded in the source code.
