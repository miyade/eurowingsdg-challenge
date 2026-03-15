# Eurowings Flight Offers

> **Live demo:** https://eurowingsdg-challenge-production.up.railway.app/

Flight search UI built on a mocked Eurowings API. Filter by route, dates, seat availability, and price. Results update as you type, sort in four directions, and the full filter state is reflected in the URL.

## Stack

- **Nuxt 4 + Vue 3 + TypeScript** (strict mode)
- **Pinia** — composition API store with URL state sync
- **v-calendar 3** — date picker (lazy-loaded deferred until first use)
- **Vitest + @vue/test-utils** — unit and component tests
- **Playwright** — end-to-end tests (desktop Chrome + mobile)
- **Plain scoped CSS with CSS custom properties** — no Tailwind, no UI library
- **Railway** — deployment with CI via GitHub Actions

## Architecture

**Shared types.** `shared/types/flight.ts` is the single source of truth for `Flight`, `FlightFilters`, and `FlightSortKey`. Both `app/` and `server/` import from it via the `#shared/*` path alias.

**Server-side filtering.** `GET /api/flights` accepts `origin`, `destination`, `departureDate`, and `returnDate` query parameters and filters before responding. The client fetches once and filters locally after that, but the server capability is in place for pagination or larger datasets.

**Airport search on the server.** `GET /api/airports?q=` runs city-name and IATA lookups using `@nwpr/airport-codes` on the server and returns the top 6 results. Keeping this server-side avoids bundling a 2 MB airport database to the client.

**Pinia store with URL sync.** `filteredAndSortedFlights` is a single computed that chains filtering and sorting. All sort comparators use `uuid` as a tiebreaker for stable ordering. `useUrlSync()` reads the initial state from query params on mount and keeps the URL in sync as filters change — making all filter states shareable and bookmarkable.

**`offerType` semantics.** The spec distinguishes two offer types:
- `ExactMatch` — flights matching the exact departure and return dates selected.
- `amadeusBestPrice` — best-price alternatives for the same trip duration on different dates (matching the Amadeus API's behaviour). These are shown in a separate "Best price alternatives" section, filtered by duration rather than exact dates.

**Search-first UX.** Results only appear once both origin and destination have at least 3 characters (IATA code length). Before that, a prompt is shown instead of an empty list.

**Performance.** v-calendar is lazy-loaded via `defineAsyncComponent` and only imported when the date picker popover opens. `FlightCard` is also async-loaded and only rendered when results are present. `store.fetchFlights()` is non-blocking — the shell paints immediately and the list fills in when the API responds.

**Mobile.** All base styles target mobile. Breakpoints at 640 px and 960 px progressively enhance layout. The header extends behind the device status bar via `viewport-fit=cover` and `env(safe-area-inset-top)`.

## Prerequisites

- **Node 20+** (CI uses Node 20)

## Project structure

- `app/` — Nuxt app (pages, components, stores, composables)
- `server/` — API routes (`/api/flights`, `/api/airports`)
- `shared/` — Shared TypeScript types (`#shared/*` alias in tsconfig)

## Getting started

```bash
npm install
npm run dev
```

App runs at http://localhost:3000.

## Testing

```bash
# Unit and component tests
npm test

# E2E tests (first time: install browser binaries; dev server starts automatically)
npx playwright install chromium
npm run test:e2e
```

**Unit tests** cover utility functions (`formatPrice`, `formatDate`, `getTripDuration`), the `useFlightDateConstraints` composable, and component rendering states (`FlightCard`, `FlightFilters`, `FlightList`).

**End-to-end tests** run against desktop Chrome and a mobile Pixel 5 viewport. They cover pre-search state, filtered results, autocomplete, `ExactMatch`/`amadeusBestPrice` offer splitting, sort ordering, and the price popover. Playwright starts the dev server automatically; no need to run `npm run dev` in another terminal.

**Git hooks** — pre-commit runs unit tests, pre-push runs the full Playwright suite. Both block on failure.

**CI** — GitHub Actions runs `npm test` (unit tests only) on every push and pull request. E2E tests run locally or via the pre-push hook.