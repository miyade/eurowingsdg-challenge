import { computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { airports } from '@nwpr/airport-codes'

export interface AirportSuggestion {
  iata: string
  label: string
}

export function useAirportSearch(query: Ref<string>): ComputedRef<AirportSuggestion[]> {
  return computed<AirportSuggestion[]>(() => {
    const q = query.value.trim()

    if (q.length < 2) return []

    const lower = q.toLowerCase()

    const scored = airports
      .filter((a) => {
        if (!a.iata || a.iata.length === 0) return false
        const iata = a.iata.toLowerCase()
        const city = (a.city ?? '').toLowerCase()
        const name = (a.name ?? '').toLowerCase()
        return (
          iata.startsWith(lower) ||
          city.includes(lower) ||
          name.includes(lower)
        )
      })
      .map((a) => {
        const iata = (a.iata ?? '').toLowerCase()
        const city = (a.city ?? '').toLowerCase()
        let score = 2
        if (iata === lower) score = 0
        else if (iata.startsWith(lower)) score = 1
        else if (city.startsWith(lower)) score = 1
        return { airport: a, score }
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 6)

    return scored.map(({ airport: a }) => ({
      iata: a.iata as string,
      label: `${a.iata} — ${a.name}, ${a.country}`,
    }))
  })
}
