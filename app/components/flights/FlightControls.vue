<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useFlightsStore } from '~/stores/flights'
import type { FlightSortKey } from '#shared/types/flight'

const store = useFlightsStore()

const sortModel = computed<FlightSortKey>({
  get: () => store.sortKey,
  set: (val) => store.setSortKey(val),
})

const maxBound = computed(() => {
  if (!store.flights.length) return 400
  return Math.ceil(Math.max(...store.flights.map((f) => f.price.amount)))
})

const pricePopoverOpen = ref(false)
const sliderValue = ref(maxBound.value)

onMounted(() => {
  sliderValue.value = store.filters.maxPrice ?? maxBound.value
})

watch(
  () => store.filters.maxPrice,
  (maxPrice) => {
    sliderValue.value = maxPrice ?? maxBound.value
  },
)

function openPricePopover() {
  sliderValue.value = store.filters.maxPrice ?? maxBound.value
  pricePopoverOpen.value = !pricePopoverOpen.value
}

const isPriceActive = computed(
  () => store.filters.maxPrice !== undefined && store.filters.maxPrice < maxBound.value,
)

const priceWrapperRef = ref<HTMLElement | null>(null)

function onDocumentClick(e: MouseEvent) {
  if (priceWrapperRef.value && !priceWrapperRef.value.contains(e.target as Node)) {
    pricePopoverOpen.value = false
  }
}

watch(pricePopoverOpen, (open) => {
  if (open) {
    nextTick(() => document.addEventListener('click', onDocumentClick))
  } else {
    document.removeEventListener('click', onDocumentClick)
  }
})

onUnmounted(() => document.removeEventListener('click', onDocumentClick))

const sortOptions: { value: FlightSortKey | 'none'; label: string }[] = [
  { value: 'none', label: 'Sort by' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'date-asc', label: 'Date ↑' },
  { value: 'date-desc', label: 'Date ↓' },
]

const filterChips = computed(() => [
  {
    label: 'Low seats',
    active: store.filters.lowSeatsOnly === true,
    onToggle: () =>
      store.setFilters({ lowSeatsOnly: store.filters.lowSeatsOnly === true ? undefined : true }),
  },
])
</script>

<template>
  <div class="controls">
    <div class="controls__sort">
      <label for="sort-select" class="sr-only">Sort flights</label>
      <select id="sort-select" v-model="sortModel" class="controls__select">
        <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div class="controls__chips" role="group" aria-label="Filter options">
      <button
        v-for="chip in filterChips"
        :key="chip.label"
        type="button"
        class="controls__chip"
        :class="{ 'controls__chip--active': chip.active }"
        :aria-pressed="chip.active"
        @click="chip.onToggle()"
      >
        {{ chip.label }}
      </button>
    </div>

    <div ref="priceWrapperRef" class="controls__price-wrapper">
      <button
        type="button"
        class="controls__chip"
        :class="{ 'controls__chip--active': isPriceActive }"
        :aria-pressed="isPriceActive"
        aria-haspopup="true"
        :aria-expanded="pricePopoverOpen"
        @click="openPricePopover"
      >
        Price{{ isPriceActive ? ': max €' + sliderValue : '' }}
      </button>

      <div
        v-if="pricePopoverOpen"
        class="price-popover"
        role="dialog"
        aria-label="Set maximum price"
      >
        <div class="price-popover__header">
          <span class="price-popover__label">Max price</span>
          <span class="price-popover__value">€{{ sliderValue }}</span>
        </div>
        <input
          type="range"
          class="price-popover__slider"
          :min="0"
          :max="maxBound"
          :step="10"
          v-model.number="sliderValue"
          :aria-label="'Maximum price: ' + sliderValue + ' euros'"
          @change="store.setFilters({ maxPrice: sliderValue })"
        />
        <div class="price-popover__bounds">
          <span>€0</span>
          <span>€{{ maxBound }}</span>
        </div>
        <button
          v-if="isPriceActive"
          type="button"
          class="price-popover__clear"
          @click="store.setFilters({ maxPrice: undefined }); sliderValue = maxBound"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
}

.controls__sort {
  flex-shrink: 0;
}

.controls__select {
  padding: var(--space-xs) var(--space-sm);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
  background: var(--color-white);
  cursor: pointer;
  min-height: 36px;
}

.controls__select:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.controls__chips {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
  align-items: center;
}

.controls__chips::-webkit-scrollbar {
  display: none;
}

.controls__chip {
  white-space: nowrap;
  flex-shrink: 0;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--color-neutral-200);
  background: var(--color-white);
  color: var(--color-neutral-700);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  min-height: 36px;
  transition: all var(--transition-default);
}

.controls__chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.controls__chip--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}

.controls__chip--active:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  color: var(--color-white);
}

.controls__chip:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.controls__price-wrapper {
  position: relative;
  flex-shrink: 0;
}

.price-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--color-white);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: var(--space-md);
  width: 220px;
  max-width: min(220px, calc(100vw - var(--space-md) * 2));
  z-index: 50;
}

@media (max-width: 480px) {
  .price-popover {
    right: 0;
    left: auto;
    width: min(220px, calc(100vw - var(--space-md) * 2));
  }
}

.price-popover__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
  gap: var(--space-sm);
  min-width: 0;
}

.price-popover__label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
}

.price-popover__value {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  min-width: 4ch;
  text-align: right;
  flex-shrink: 0;
}

.price-popover__slider {
  width: 100%;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.price-popover__bounds {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  margin-top: var(--space-xs);
}

.price-popover__clear {
  margin-top: var(--space-sm);
  width: 100%;
  background: none;
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-sm);
  padding: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  cursor: pointer;
  min-height: 36px;
  transition: all var(--transition-default);
}

.price-popover__clear:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
