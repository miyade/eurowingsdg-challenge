<script setup lang="ts">
import { useFlightsStore } from '~/stores/flights'

const store = useFlightsStore()
store.fetchFlights()
store.useUrlSync()
</script>

<template>
  <div class="page">
    <a href="#main-content" class="skip-link">Skip to search form</a>
    <AppHeader />
    <div class="page__hero" aria-hidden="true" />
    <main id="main-content" class="page__content" tabindex="-1">
      <ClientOnly>
      <FlightFilters />
      <FlightControls v-if="store.hasAllFilters" />
      <FlightList />
      </ClientOnly>
    </main>
  </div>
</template>

<style>
.skip-link {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-white);
  color: var(--color-primary);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  text-decoration: none;
  border-radius: 0 0 var(--radius-md) 0;
  box-shadow: var(--shadow-card);
  transform: translateY(-100%);
  transition: transform 0.15s ease;
}
.skip-link:focus {
  transform: translateY(0);
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.page {
  min-height: 100vh;
  background: var(--color-neutral-100);
  overflow-x: hidden;
  position: relative;
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
