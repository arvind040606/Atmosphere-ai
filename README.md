# Atmosphere AI — Professional Weather Intelligence Platform

A premium, production-grade weather forecasting interface built with React, TypeScript, and Tailwind CSS. Phase 1 delivers the foundation: a fully animated, weather-reactive hero experience, global city search, a live current-conditions dashboard, dark/light theming, and resilient loading/error states.

## Tech stack

- **React 19 + Vite** — build tooling
- **TypeScript (strict)** — end-to-end types for every API response
- **Tailwind CSS v4** — CSS-first theme tokens (`src/index.css`)
- **Framer Motion** — hero animation system (`src/animations`)
- **TanStack React Query** — server-state, caching, retries
- **Axios** — HTTP client with typed error normalization
- **Lucide React** — icon set
- **WeatherAPI.com** — live weather data

## Getting started

```bash
npm install
cp .env.example .env
# add your key to .env — get one free at https://www.weatherapi.com/signup.aspx
npm run dev
```

The app runs without a key (you'll see the calm empty/error states), but live weather requires `VITE_WEATHER_API_KEY`.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Architecture

```
src/
 ├─ animations/      Sky Stage hero system — SunLayer, RainLayer, StormLayer,
 │                    SnowLayer, FogLayer, CloudLayer + theme tokens
 ├─ components/
 │   ├─ ui/           Glass-morphism primitives, skeletons, empty/error states
 │   ├─ search/       City search with debounced autocomplete
 │   ├─ weather/      Current-conditions hero + stat grid
 │   └─ layout/       Header, theme toggle, unit toggle
 ├─ context/          SettingsContext (theme mode, unit, persisted)
 ├─ constants/        Condition-code mapping, storage/query keys
 ├─ hooks/            useWeather, useGeolocation, useRecentSearches
 ├─ layouts/          Page chrome
 ├─ pages/            HomePage (orchestrates the whole flow)
 ├─ services/         apiClient (axios + error normalization), weatherService
 ├─ types/            Domain types (WeatherSnapshot, CurrentWeather, …)
 └─ utils/            Formatting, weather-icon mapping
```

### Design system

Defined as Tailwind v4 theme tokens in `src/index.css`:

- **Display type:** Bricolage Grotesque (temperature, headings)
- **Body type:** Inter
- **Data/mono type:** IBM Plex Mono (timestamps, coordinates — used in later phases)
- **Condition accents:** sun, rain, storm, snow, fog — each with a light/dark gradient pair driving the hero's "Sky Stage"

### The Sky Stage

`src/animations/SkyStage.tsx` is the signature element: a full-bleed animated scene whose gradient and particle layer swap based on the live weather condition family (sun / cloud / rain / storm / snow / fog), built entirely with Framer Motion + CSS — no canvas or heavy particle libraries. Each layer is its own component so new conditions or richer effects can be added independently in later phases.

### Resilience

- Network failure, invalid city, auth failure, and rate-limit responses are normalized into a typed `WeatherApiError` with a user-facing message (`src/services/apiClient.ts`).
- Geolocation permission denial never breaks the UI — it falls back to the search-first empty state (`src/hooks/useGeolocation.ts`).
- `prefers-reduced-motion` is respected globally; all interactive elements have visible keyboard focus.

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_WEATHER_API_KEY` | Your WeatherAPI.com API key |

## Roadmap

- **Phase 2:** Hourly + 7-day forecast UI, Recharts temperature/precipitation/wind charts
- **Phase 3:** Air Quality Index + weather alert banners
- **Phase 4:** Interactive Leaflet weather map (temperature/rain/wind/cloud layers)
- **Phase 5:** AI weather assistant
- **Phase 6:** Performance pass (code splitting, image optimization) + Vercel deployment

## Deployment (Vercel)

```bash
npm run build
```

Push to GitHub, import the repo in Vercel, set the `VITE_WEATHER_API_KEY` environment variable in the Vercel project settings, and deploy — no other configuration is required for a Vite project.
