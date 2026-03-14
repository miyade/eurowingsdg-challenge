import { airports } from '@nwpr/airport-codes'

export default defineEventHandler((event) => {
  const { q } = getQuery<{ q?: string }>(event)

  if (!q || q.length < 2) return []

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
