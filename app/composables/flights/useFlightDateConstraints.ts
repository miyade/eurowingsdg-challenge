import type { Ref } from 'vue'
import { computed } from 'vue'
import { useFlightsStore } from '~/stores/flights'

export function addDaysStr(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function buildDisabledRanges(
  enabledSet: Set<string>,
  minStr: string,
  maxStr: string,
): { start: string; end: string }[] {
  const enabled = [...enabledSet].filter((d) => d >= minStr && d <= maxStr).sort()
  if (enabled.length === 0) return []
  const ranges: { start: string; end: string }[] = []
  const first = enabled[0]!
  if (first > minStr) {
    ranges.push({ start: minStr, end: addDaysStr(first, -1) })
  }
  for (let i = 0; i < enabled.length - 1; i++) {
    const start = addDaysStr(enabled[i]!, 1)
    const end = addDaysStr(enabled[i + 1]!, -1)
    if (start <= end) ranges.push({ start, end })
  }
  const last = enabled[enabled.length - 1]!
  if (addDaysStr(last, 1) <= maxStr) {
    ranges.push({ start: addDaysStr(last, 1), end: maxStr })
  }
  return ranges
}

export function useFlightDateConstraints(
  origin: Ref<string>,
  destination: Ref<string>,
  departureDate: Ref<string>,
) {
  const store = useFlightsStore()
  const today: string = new Date().toISOString().slice(0, 10)

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

  const maxDepartureStr = computed(
    (): string =>
      maxDepartureDateObj.value
        ? maxDepartureDateObj.value.toISOString().slice(0, 10)
        : today,
  )
  const maxReturnStr = computed(
    (): string =>
      maxReturnDateObj.value
        ? maxReturnDateObj.value.toISOString().slice(0, 10)
        : today,
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

  return {
    canSelectDates,
    availableDepartureDatesForRoute,
    availableReturnDatesForRoute,
    minDepartureDateObj,
    maxDepartureDateObj,
    returnMinDateObj,
    maxReturnDateObj,
    disabledDepartureDatesRanges,
    disabledReturnDatesRanges,
  }
}
