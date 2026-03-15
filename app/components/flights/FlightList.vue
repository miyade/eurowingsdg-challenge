<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useFlightsStore } from '~/stores/flights'

const store = useFlightsStore()

const FlightCard = defineAsyncComponent(() =>
  import('~/components/flights/FlightCard.vue'),
)
</script>

<template>
  <section aria-label="Flight results" aria-live="polite" aria-atomic="false">

    <div v-if="!store.hasAllFilters" class="flight-list__presearch" role="status">
      <svg
        aria-hidden="true"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="var(--color-neutral-400)"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M2.5 19h19v2h-19zm7.18-1.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-3.81-1.02-2.26-3.91-1.5-.4v3.28l-1.96-.52-.93-1.61-1.12-.3v2.43l.72.19 1.7.45-.28 1.73z" />
      </svg>
      <p class="flight-list__presearch-title">Where would you like to go?</p>
      <p class="flight-list__presearch-message">Enter your origin, destination, and dates to see available flights</p>
    </div>

    <div v-else-if="store.isLoading" class="flight-list__skeletons" aria-hidden="true">
      <div v-for="n in 4" :key="n" class="skeleton-card">
        <div class="skeleton-line skeleton-line--title" />
        <div class="skeleton-line skeleton-line--meta" />
        <div class="skeleton-line skeleton-line--price" />
      </div>
    </div>

    <div
      v-else-if="store.filteredAndSortedFlights.length === 0"
      class="flight-list__empty"
      role="status"
    >
      <svg
        aria-hidden="true"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="var(--color-neutral-400)"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </svg>
      <p class="flight-list__empty-title">No flights found</p>
      <p class="flight-list__empty-message">Try adjusting your search filters</p>
    </div>

    <div v-else class="flight-list__results">
      <p class="flight-list__count" aria-live="polite" role="status">
        {{ store.filteredAndSortedFlights.length }} flight(s) found
      </p>

      <div v-if="store.exactMatchFlights.length > 0" class="flight-list__section">
        <h2 class="flight-list__section-title">Your dates</h2>
        <ul class="flight-list__grid" role="list">
          <li v-for="flight in store.exactMatchFlights" :key="flight.uuid">
            <FlightCard :flight="flight" />
          </li>
        </ul>
      </div>

      <div v-if="store.bestPriceFlights.length > 0" class="flight-list__section">
        <h2 class="flight-list__section-title">
          Best price alternatives
          <span class="flight-list__section-subtitle">Flexible dates</span>
        </h2>
        <ul class="flight-list__grid" role="list">
          <li v-for="flight in store.bestPriceFlights" :key="flight.uuid">
            <FlightCard :flight="flight" />
          </li>
        </ul>
      </div>
    </div>

  </section>
</template>

<style scoped>
.flight-list__skeletons {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.flight-list__grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  list-style: none;
  padding: 0;
  margin: 0;
}

.skeleton-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.skeleton-line {
  background: var(--color-neutral-200);
  border-radius: var(--radius-sm);
  height: 16px;
  animation: shimmer 1.5s infinite ease-in-out;
}

.skeleton-line--title {
  width: 60%;
  height: 24px;
}

.skeleton-line--meta {
  width: 40%;
}

.skeleton-line--price {
  width: 30%;
  height: 32px;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.flight-list__presearch {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl) var(--space-md);
  text-align: center;
  gap: var(--space-sm);
}

.flight-list__presearch-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
  margin: 0;
}

.flight-list__presearch-message {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  margin: 0;
}

.flight-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl) var(--space-md);
  text-align: center;
  gap: var(--space-sm);
}

.flight-list__empty-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
  margin: 0;
}

.flight-list__empty-message {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  margin: 0;
}

.flight-list__count {
  font-size: var(--text-sm);
  color: var(--color-neutral-700);
  margin: 0 0 var(--space-sm) 0;
}

.flight-list__section {
  margin-bottom: var(--space-xl);
}

.flight-list__section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
  margin: 0 0 var(--space-sm) 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.flight-list__section-subtitle {
  font-size: var(--text-xs, 0.75rem);
  font-weight: var(--font-normal);
  color: var(--color-neutral-500);
}

@media (min-width: 640px) {
  .flight-list__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 960px) {
  .flight-list__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
