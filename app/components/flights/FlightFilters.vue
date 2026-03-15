<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFlightsStore } from '~/stores/flights'
import AirportInput from '~/components/flights/AirportInput.vue'
import DatePickerInput from '~/components/flights/DatePickerInput.vue'

const store = useFlightsStore()

const origin = ref('')
const destination = ref('')
const departureDate = ref('')
const returnDate = ref('')

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

const canSelectDates = computed(() =>
  origin.value.length >= 3 && destination.value.length >= 3,
)

const availableDepartureDatesForRoute = computed(() => {
  if (!canSelectDates.value) return new Set<string>()
  return new Set(
    store.flights
      .filter(
        (f) =>
          f.origin.toLowerCase() === origin.value.toLowerCase() &&
          f.destination.toLowerCase() === destination.value.toLowerCase(),
      )
      .map((f) => f.departureDate),
  )
})

const availableReturnDatesForRoute = computed(() => {
  if (!canSelectDates.value) return new Set<string>()
  return new Set(
    store.flights
      .filter(
        (f) =>
          f.origin.toLowerCase() === origin.value.toLowerCase() &&
          f.destination.toLowerCase() === destination.value.toLowerCase() &&
          (!departureDate.value || f.departureDate === departureDate.value),
      )
      .map((f) => f.returnDate),
  )
})

function addDaysStr(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function buildDisabledRanges(
  enabledSet: Set<string>,
  minStr: string,
  maxStr: string,
): { start: string; end: string }[] {
  const enabled = [...enabledSet].filter((d) => d >= minStr && d <= maxStr).sort()
  if (enabled.length === 0) return []
  const ranges: { start: string; end: string }[] = []
  if (enabled[0] > minStr) {
    ranges.push({ start: minStr, end: addDaysStr(enabled[0], -1) })
  }
  for (let i = 0; i < enabled.length - 1; i++) {
    const start = addDaysStr(enabled[i], 1)
    const end = addDaysStr(enabled[i + 1], -1)
    if (start <= end) ranges.push({ start, end })
  }
  const last = enabled[enabled.length - 1]
  if (addDaysStr(last, 1) <= maxStr) {
    ranges.push({ start: addDaysStr(last, 1), end: maxStr })
  }
  return ranges
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

const maxDepartureStr = computed(() =>
  maxDepartureDateObj.value ? maxDepartureDateObj.value.toISOString().split('T')[0] : today,
)
const maxReturnStr = computed(() =>
  maxReturnDateObj.value ? maxReturnDateObj.value.toISOString().split('T')[0] : today,
)

const disabledDepartureDatesRanges = computed(() => {
  if (!canSelectDates.value) return []
  return buildDisabledRanges(availableDepartureDatesForRoute.value, today, maxDepartureStr.value)
})

const disabledReturnDatesRanges = computed(() => {
  if (!canSelectDates.value) return []
  const minStr = departureDate.value || today
  return buildDisabledRanges(availableReturnDatesForRoute.value, minStr, maxReturnStr.value)
})

watch(departureDate, (newDep) => {
  if (returnDate.value && newDep && returnDate.value < newDep) {
    returnDate.value = ''
  }
})

watch([origin, destination], () => {
  if (departureDate.value && !availableDepartureDatesForRoute.value.has(departureDate.value)) {
    departureDate.value = ''
  }
  if (returnDate.value && !availableReturnDatesForRoute.value.has(returnDate.value)) {
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

      <div class="filters__field">
        <AirportInput
          v-model="origin"
          label="From"
          input-id="filter-origin"
          placeholder="e.g. DUS"
          suggestions-list-id="origin-suggestions"
        />
      </div>

      <div class="filters__field">
        <AirportInput
          v-model="destination"
          label="To"
          input-id="filter-destination"
          placeholder="e.g. BCN"
          suggestions-list-id="destination-suggestions"
        />
      </div>

      <div class="filters__field">
        <DatePickerInput
          v-model="departureDate"
          label="Departure"
          input-id="filter-departure"
          :disabled="!canSelectDates"
          :min-date="minDepartureDateObj"
          :max-date="maxDepartureDateObj"
          :disabled-dates="disabledDepartureDatesRanges"
        />
      </div>

      <div class="filters__field">
        <DatePickerInput
          v-model="returnDate"
          label="Return"
          input-id="filter-return"
          :disabled="!canSelectDates"
          :min-date="returnMinDateObj"
          :max-date="maxReturnDateObj"
          :disabled-dates="disabledReturnDatesRanges"
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
