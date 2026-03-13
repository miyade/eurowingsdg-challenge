<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFlightsStore } from '~/stores/flights'

const store = useFlightsStore()

const origin = ref('')
const destination = ref('')
const departureDate = ref('')
const returnDate = ref('')

const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)

const originSuggestions = computed(() =>
  store.availableOrigins.filter(o =>
    o.toLowerCase().startsWith(origin.value.toLowerCase()) && origin.value.length > 0
  )
)

const destinationSuggestions = computed(() =>
  store.availableDestinations.filter(d =>
    d.toLowerCase().startsWith(destination.value.toLowerCase()) && destination.value.length > 0
  )
)

watch([origin, destination, departureDate, returnDate], () => {
  store.setFilters({
    origin: origin.value || undefined,
    destination: destination.value || undefined,
    departureDate: departureDate.value || undefined,
    returnDate: returnDate.value || undefined,
  })
})

function selectOrigin(value: string) {
  origin.value = value
  showOriginSuggestions.value = false
}

function selectDestination(value: string) {
  destination.value = value
  showDestinationSuggestions.value = false
}

function blurOrigin() {
  setTimeout(() => { showOriginSuggestions.value = false }, 150)
}

function blurDestination() {
  setTimeout(() => { showDestinationSuggestions.value = false }, 150)
}

function clearFilters() {
  origin.value = ''
  destination.value = ''
  departureDate.value = ''
  returnDate.value = ''
}
</script>

<template>
  <section class="filters" aria-label="Filter flights">
    <div class="filters__row">

      <!-- Origin -->
      <div class="filters__field">
        <label for="filter-origin" class="filters__label">From</label>
        <div class="filters__autocomplete">
          <input
            id="filter-origin"
            v-model="origin"
            type="text"
            class="filters__input"
            placeholder="e.g. DUS"
            autocomplete="off"
            aria-autocomplete="list"
            aria-controls="origin-suggestions"
            :aria-expanded="showOriginSuggestions && originSuggestions.length > 0"
            @focus="showOriginSuggestions = true"
            @blur="blurOrigin"
          />
          <ul
            v-if="showOriginSuggestions && originSuggestions.length > 0"
            id="origin-suggestions"
            class="filters__suggestions"
            role="listbox"
            aria-label="Origin suggestions"
          >
            <li
              v-for="s in originSuggestions"
              :key="s"
              role="option"
              class="filters__suggestion"
              @mousedown="selectOrigin(s)"
            >
              {{ s }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Destination -->
      <div class="filters__field">
        <label for="filter-destination" class="filters__label">To</label>
        <div class="filters__autocomplete">
          <input
            id="filter-destination"
            v-model="destination"
            type="text"
            class="filters__input"
            placeholder="e.g. BCN"
            autocomplete="off"
            aria-autocomplete="list"
            aria-controls="destination-suggestions"
            :aria-expanded="showDestinationSuggestions && destinationSuggestions.length > 0"
            @focus="showDestinationSuggestions = true"
            @blur="blurDestination"
          />
          <ul
            v-if="showDestinationSuggestions && destinationSuggestions.length > 0"
            id="destination-suggestions"
            class="filters__suggestions"
            role="listbox"
            aria-label="Destination suggestions"
          >
            <li
              v-for="s in destinationSuggestions"
              :key="s"
              role="option"
              class="filters__suggestion"
              @mousedown="selectDestination(s)"
            >
              {{ s }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Departure date -->
      <div class="filters__field">
        <label for="filter-departure" class="filters__label">Departure</label>
        <input
          id="filter-departure"
          v-model="departureDate"
          type="date"
          class="filters__input"
          aria-label="Departure date"
        />
      </div>

      <!-- Return date -->
      <div class="filters__field">
        <label for="filter-return" class="filters__label">Return</label>
        <input
          id="filter-return"
          v-model="returnDate"
          type="date"
          class="filters__input"
          aria-label="Return date"
        />
      </div>

    </div>

    <button
      v-if="origin || destination || departureDate || returnDate"
      class="filters__clear"
      type="button"
      aria-label="Clear all filters"
      @click="clearFilters"
    >
      Clear filters
    </button>
  </section>
</template>

<style scoped>
.filters {
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.filters__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.filters__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  position: relative;
  min-width: 0;
}

.filters__label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
}

.filters__input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--color-neutral-900);
  background: var(--color-white);
  transition: border-color var(--transition-default);
  box-sizing: border-box;
  min-height: 44px;
}

.filters__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(228, 0, 58, 0.12);
}

.filters__autocomplete {
  position: relative;
}

.filters__suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-white);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-card);
  list-style: none;
  margin: 0;
  padding: var(--space-xs) 0;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.filters__suggestion {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-neutral-900);
  cursor: pointer;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.filters__suggestion:hover {
  background: var(--color-neutral-50);
  color: var(--color-primary);
}

.filters__clear {
  align-self: flex-start;
  background: none;
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  cursor: pointer;
  min-height: 44px;
  transition: all var(--transition-default);
}

.filters__clear:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filters__clear:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

@media (min-width: 640px) {
  .filters__row {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}
</style>
