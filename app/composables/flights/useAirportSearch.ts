import { ref, computed, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface AirportSuggestion {
  iata: string
  label: string
}

export function useAirportSearch(query: Ref<string>): ComputedRef<AirportSuggestion[]> {
  const results = ref<AirportSuggestion[]>([])

  watch(query, async (q) => {
    if (q.length < 2) {
      results.value = []
      return
    }
    results.value = await $fetch<AirportSuggestion[]>(`/api/airports?q=${encodeURIComponent(q)}`)
  })

  return computed(() => results.value)
}
