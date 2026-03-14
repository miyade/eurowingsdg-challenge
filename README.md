# Eurowings Flight Offers

Fetches flights from a mocked API and lets users filter and sort results client-side, with additional server-side filtering support on the API route.

## Live Demo

https://eurowingsdg-challenge-production.up.railway.app/

## Tech Stack

- **Nuxt 4 + Vue 3 + TypeScript** (strict mode)
- **Pinia** for state management (composition API style)
- **Vitest + @vue/test-utils** for unit and component tests
- **Playwright** for end-to-end tests
- **Plain CSS with custom properties** — no Tailwind, no UI library
- **Railway** for deployment

## Architecture decisions

**Feature-based component structure.** Components live under `app/components/flights/` and `app/components/layout/` rather than a flat directory. Nuxt's auto-import resolves them without path aliases.

**Shared types via `#shared/*` alias.** The `shared/types/flight.ts` module is accessible from both `app/` and `server/` through a `#shared/*` path alias configured in `tsconfig.json` and `vitest.config.ts`. This means the `Flight` and `FlightFilters` types are the single source of truth for both the API response and the frontend state.

**Server-side filtering.** The `GET /api/flights` route accepts `origin`, `destination`, `departureDate`, and `returnDate` query parameters and filters the dataset before responding. The frontend currently fetches everything and filters client-side, but the server-side capability is there for when the dataset grows.

**Pinia store with stable sort.** `filteredAndSortedFlights` is a single computed that chains filtering and sorting. All sort comparators use the flight `uuid` as a tiebreaker to guarantee a stable order across re-renders when prices or dates are equal.

**Mobile-first CSS.** All base styles target mobile. Breakpoints at `640px` and `960px` progressively enhance layout — two-column grid, larger type, wider padding. The filter panel uses a bottom sheet on mobile and renders inline on desktop.

**Search-first UX.** The results list only appears once both origin and destination are entered (minimum 3 characters each, matching IATA code length). Before that, a prompt is shown instead of an empty list. This avoids showing "0 results" before the user has actually searched.

## Getting started

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000.

## Testing

```bash
# Unit and component tests
npm test

# E2e tests (first time: install browser binaries)
npx playwright install chromium
npx playwright test
```

**Unit and component tests** — 23 tests via Vitest covering utility functions (`formatPrice`, `formatDate`, `getTripDuration`), component rendering states (`FlightCard`, `FlightFilters`, `FlightList`), and store filtering/sorting logic.

**End-to-end tests** — 14 tests via Playwright running against both desktop and mobile viewports. They cover the pre-search state, flight results after filtering, autocomplete suggestions, sort ordering, and the price popover.

**Git hooks** — a pre-commit hook runs the unit tests before every commit. A pre-push hook runs the full Playwright suite before every push. Both block on failure.
