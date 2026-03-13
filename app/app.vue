<script setup lang="ts">
import { useFlightsStore } from '~/stores/flights'

const store = useFlightsStore()
await store.fetchFlights()
</script>

<template>
  <div class="page">
    <AppHeader />
    <div class="page__hero" aria-hidden="true" />
    <main class="page__content">
      <FlightFilters />
      <FlightCard
        v-if="store.flights.length"
        :flight="store.flights[0]"
      />
    </main>
  </div>
</template>

<style>
.page {
  min-height: 100vh;
  background: var(--color-neutral-100);
  overflow-x: hidden;
}

.page__hero {
  height: 80px;
  background: linear-gradient(135deg, #E4003A 0%, #B8002E 100%);
  margin-top: -1px;
}

.page__content {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-md);
  transform: translateY(-40px);
  box-sizing: border-box;
  width: 100%;
}

@media (min-width: 640px) {
  .page__hero {
    height: 120px;
  }

  .page__content {
    padding: var(--space-xl);
    transform: translateY(-60px);
  }
}
</style>
