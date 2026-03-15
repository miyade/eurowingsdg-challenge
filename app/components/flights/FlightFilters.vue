<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import { useFlightsStore } from '~/stores/flights'
import { useAirportSearch } from '~/composables/flights/useAirportSearch'

const store = useFlightsStore()

const origin = ref('')
const destination = ref('')
const departureDate = ref('')
const returnDate = ref('')

const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)
const showDeparturePicker = ref(false)
const showReturnPicker = ref(false)

const originSuggestions = useAirportSearch(origin)
const destinationSuggestions = useAirportSearch(destination)

watch(
  () => store.filters,
  (storeFilters) => {
    origin.value = storeFilters.origin ?? ''
    destination.value = storeFilters.destination ?? ''
    departureDate.value = storeFilters.departureDate ?? ''
    returnDate.value = storeFilters.returnDate ?? ''
  },
  { deep: true, immediate: true, once: true },
)

watch([origin, destination, departureDate, returnDate], () => {
  const nextOrigin = origin.value || undefined
  const nextDestination = destination.value || undefined
  const nextDepartureDate = departureDate.value || undefined
  const nextReturnDate = returnDate.value || undefined

  if (
    nextOrigin === store.filters.origin &&
    nextDestination === store.filters.destination &&
    nextDepartureDate === store.filters.departureDate &&
    nextReturnDate === store.filters.returnDate
  ) return

  store.setFilters({
    origin: nextOrigin,
    destination: nextDestination,
    departureDate: nextDepartureDate,
    returnDate: nextReturnDate,
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

const today = new Date().toISOString().split('T')[0]

const availableDepartureDates = computed(() =>
  store.flights.map((f) => f.departureDate).sort(),
)
const minDepartureDateObj = computed(() => new Date(today + 'T12:00:00'))
const maxDepartureDateObj = computed(() => {
  const s = availableDepartureDates.value.at(-1)
  return s ? new Date(s + 'T12:00:00') : null
})

const availableReturnDates = computed(() =>
  store.flights.map((f) => f.returnDate).sort(),
)
const maxReturnDateObj = computed(() => {
  const s = availableReturnDates.value.at(-1)
  return s ? new Date(s + 'T12:00:00') : null
})

const returnMinDateObj = computed(() => {
  const s = departureDate.value || today
  return new Date(s + 'T12:00:00')
})

const departureDateModel = computed({
  get: () => departureDate.value ? new Date(departureDate.value + 'T12:00:00') : null,
  set: (val: Date | null) => {
    departureDate.value = val ? val.toISOString().split('T')[0] : ''
  },
})

const returnDateModel = computed({
  get: () => returnDate.value ? new Date(returnDate.value + 'T12:00:00') : null,
  set: (val: Date | null) => {
    returnDate.value = val ? val.toISOString().split('T')[0] : ''
  },
})

function onDeparturePicked() {
  nextTick(() => { showDeparturePicker.value = false })
}

function onReturnPicked() {
  nextTick(() => { showReturnPicker.value = false })
}

function formatDisplay(str: string): string {
  if (!str) return ''
  const d = new Date(str + 'T12:00:00')
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

function onDocumentClick(e: MouseEvent) {
  const target = e.target as Node
  if (target && !(target as Element).closest?.('.filters__datepicker-wrapper')) {
    showDeparturePicker.value = false
    showReturnPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})

watch(departureDate, (newDep) => {
  if (returnDate.value && newDep && returnDate.value < newDep) {
    returnDate.value = ''
  }
})

function clearFilters() {
  origin.value = ''
  destination.value = ''
  departureDate.value = ''
  returnDate.value = ''
  store.resetFilters()
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
          role="combobox"
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
              :key="s.iata"
              role="option"
              class="filters__suggestion"
              @mousedown="selectOrigin(s.iata)"
            >
              {{ s.label }}
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
          role="combobox"
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
              :key="s.iata"
              role="option"
              class="filters__suggestion"
              @mousedown="selectDestination(s.iata)"
            >
              {{ s.label }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Departure date -->
      <div class="filters__field filters__datepicker-wrapper">
        <label for="filter-departure" class="filters__label">Departure</label>
        <button
          id="filter-departure"
          type="button"
          class="filters__input filters__datepicker-trigger"
          :class="{ 'filters__datepicker-trigger--active': departureDate }"
          aria-label="Departure date"
          aria-haspopup="dialog"
          :aria-expanded="showDeparturePicker"
          @click="showDeparturePicker = !showDeparturePicker"
        >
          <span>{{ departureDate ? formatDisplay(departureDate) : 'dd.mm.yyyy' }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
        <div v-if="showDeparturePicker" class="filters__datepicker-popover">
          <DatePicker
            v-model="departureDateModel"
            :min-date="minDepartureDateObj"
            :max-date="maxDepartureDateObj"
            @dayclick="(_, event) => (event?.target as HTMLElement)?.blur()"
            @update:model-value="onDeparturePicked"
          />
        </div>
      </div>

      <!-- Return date -->
      <div class="filters__field filters__datepicker-wrapper">
        <label for="filter-return" class="filters__label">Return</label>
        <button
          id="filter-return"
          type="button"
          class="filters__input filters__datepicker-trigger"
          :class="{ 'filters__datepicker-trigger--active': returnDate }"
          aria-label="Return date"
          aria-haspopup="dialog"
          :aria-expanded="showReturnPicker"
          @click="showReturnPicker = !showReturnPicker"
        >
          <span>{{ returnDate ? formatDisplay(returnDate) : 'dd.mm.yyyy' }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
        <div v-if="showReturnPicker" class="filters__datepicker-popover">
          <DatePicker
            v-model="returnDateModel"
            :min-date="returnMinDateObj"
            :max-date="maxReturnDateObj"
            @dayclick="(_, event) => (event?.target as HTMLElement)?.blur()"
            @update:model-value="onReturnPicked"
          />
        </div>
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
  -webkit-appearance: none;
  appearance: none;
  font-family: inherit;
}

.filters__input[type="date"] {
  display: flex;
  align-items: center;
}

.filters__input[type="date"]::-webkit-datetime-edit {
  color: var(--color-neutral-900);
  padding: 0;
}

.filters__input[type="date"]::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
}

.filters__input[type="date"]::-webkit-date-and-time-value {
  color: var(--color-neutral-900);
  min-height: 1.2em;
  text-align: left;
}

.filters__input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0.6;
  cursor: pointer;
}

.filters__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(228, 0, 58, 0.12);
}

.filters__datepicker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  text-align: left;
  cursor: pointer;
  color: var(--color-neutral-500);
}

.filters__datepicker-trigger--active {
  color: var(--color-neutral-900);
}

.filters__datepicker-popover {
  --vc-accent-600: #E4003A;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  z-index: 100;
  background: var(--color-white);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
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
