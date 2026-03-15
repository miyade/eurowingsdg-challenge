<script setup lang="ts">
import type { Flight } from '#shared/types/flight'
import { formatPrice, formatDate, getTripDuration } from '~/composables/flights/useFlightUtils'

const props = defineProps<{
  flight: Flight
}>()
</script>

<template>
  <article class="flight-card" :class="{ 'flight-card--best-price': props.flight.offerType === 'amadeusBestPrice' }">
    <div class="flight-route">
      <div class="flight-route__origin">
        <span class="flight-route__code">{{ props.flight.origin }}</span>
        <span class="flight-route__date">{{ formatDate(props.flight.departureDate) }}</span>
      </div>
      <div class="flight-route__arrow">→</div>
      <div class="flight-route__destination">
        <span class="flight-route__code">{{ props.flight.destination }}</span>
        <span class="flight-route__date">{{ formatDate(props.flight.returnDate) }}</span>
      </div>
    </div>

    <div class="flight-meta">
      <span>{{ getTripDuration(props.flight.departureDate, props.flight.returnDate) }} days</span>
      <span v-if="props.flight.offerType === 'amadeusBestPrice'" class="flight-badge flight-badge--best-price">
        Best price
        <span class="flight-badge__tooltip">
          Lowest price for this route with the same trip duration. Travel dates may differ from your search.
        </span>
      </span>
    </div>

    <div class="flight-price">
      <span class="flight-price__label">from</span>
      <strong class="flight-price__amount">{{ formatPrice(props.flight.price.amount, props.flight.price.currency) }}</strong>
    </div>

    <div v-if="props.flight.seatAvailability < 3" class="flight-availability">
      <span>Only {{ props.flight.seatAvailability }} seats left</span>
    </div>
  </article>
</template>

<style scoped>
.flight-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.flight-route {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.flight-route__origin,
.flight-route__destination {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.flight-route__destination {
  text-align: right;
}

.flight-route__code {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-neutral-900);
  letter-spacing: 0.05em;
}

.flight-route__date {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  white-space: nowrap;
}

.flight-route__arrow {
  flex: 1;
  text-align: center;
  color: var(--color-neutral-400);
  font-size: var(--text-lg);
  flex-shrink: 0;
}

.flight-meta {
  display: flex;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

.flight-meta span + span::before {
  content: "·";
  margin-right: var(--space-sm);
}

.flight-price {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
}

.flight-price__label {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

.flight-price__amount {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  line-height: 1;
}

.flight-availability {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: #fff3f3;
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-sm);
  color: var(--color-error);
  font-weight: var(--font-semibold);
  align-self: flex-start;
}

.flight-card--best-price {
  background: #fffbf0;
  border-left: 3px solid #f59e0b;
}

.flight-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-lg);
  font-size: var(--text-xs, 0.75rem);
  font-weight: var(--font-semibold);
  position: relative;
  cursor: default;
}

.flight-badge--best-price {
  background: #fef3c7;
  color: #92400e;
}

.flight-badge__tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  background: var(--color-neutral-900);
  color: var(--color-white);
  font-size: var(--text-xs, 0.75rem);
  font-weight: var(--font-normal);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  width: 220px;
  line-height: 1.4;
  z-index: 50;
  pointer-events: none;
}

.flight-badge:hover .flight-badge__tooltip {
  display: block;
}

@media (min-width: 640px) {
  .flight-card {
    padding: var(--space-lg);
    gap: var(--space-md);
  }

  .flight-route__code {
    font-size: var(--text-2xl);
  }

  .flight-price__amount {
    font-size: var(--text-3xl);
  }
}
</style>
