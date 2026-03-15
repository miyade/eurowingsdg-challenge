import type { Flight } from '#shared/types/flight'

const OFFER_TYPES: Flight['offerType'][] = ['ExactMatch', 'amadeusBestPrice']

function uuid(seed: number): string {
  const hex = (n: number) => Math.floor(Math.abs(n)).toString(16).padStart(8, '0').slice(-8)
  return `${hex(seed)}-${hex(seed * 31)}-4${hex(seed * 17).slice(1)}-a${hex(seed * 13).slice(1)}-${hex(seed * 7)}${hex(seed * 11)}`
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const ROUTES: [string, string][] = [
  ['DUS', 'BCN'], ['DUS', 'MAD'], ['DUS', 'FCO'], ['DUS', 'AMS'], ['DUS', 'LHR'],
  ['HAM', 'FCO'], ['HAM', 'BCN'], ['HAM', 'MUC'], ['HAM', 'VIE'],
  ['BER', 'MAD'], ['BER', 'BCN'], ['BER', 'LIS'], ['BER', 'PRG'],
  ['MUC', 'LHR'], ['MUC', 'BCN'], ['MUC', 'CDG'], ['MUC', 'ZRH'],
  ['VIE', 'AMS'], ['VIE', 'BCN'], ['VIE', 'FCO'],
  ['FCO', 'ZRH'], ['FCO', 'BCN'], ['FCO', 'MAD'],
  ['BCN', 'PRG'], ['BCN', 'LIS'], ['BCN', 'WAW'],
  ['CDG', 'DUS'], ['CDG', 'MAD'], ['CDG', 'LHR'],
  ['AMS', 'LIS'], ['AMS', 'BCN'], ['LHR', 'WAW'], ['LHR', 'PRG'],
  ['MAD', 'BER'], ['MAD', 'FCO'], ['LIS', 'HAM'], ['LIS', 'MAD'],
  ['PRG', 'VIE'], ['PRG', 'BCN'], ['WAW', 'CDG'], ['ZRH', 'MUC'],
]

const START = '2026-04-01'
const END = '2026-07-30'

function dateInRange(date: string): boolean {
  return date >= START && date <= END
}

const flights: Flight[] = []
let uuidSeed = 1

for (const [origin, destination] of ROUTES) {
  const basePrice = 49 + (uuidSeed % 320)
  const numFlights = 10 + (uuidSeed % 9)

  for (let i = 0; i < numFlights; i++) {
    const dayOffset = (uuidSeed * 5 + i * 13) % 100
    const departureDate = addDays(START, dayOffset)
    if (!dateInRange(departureDate)) continue

    const tripDays = 3 + (uuidSeed + i) % 14
    const returnDate = addDays(departureDate, tripDays)
    if (!dateInRange(returnDate)) continue

    const priceVariation = (i % 6) * 12 + (uuidSeed % 25)
    const amount = Math.min(399, Math.max(49, Math.round(basePrice + priceVariation)))
    const lowSeatChance = (uuidSeed + i) % 12
    const seatAvailability = lowSeatChance === 0 ? 1 : lowSeatChance === 1 ? 2 : 4 + (uuidSeed + i) % 6
    const offerType = OFFER_TYPES[(uuidSeed + i) % 2]

    flights.push({
      origin,
      destination,
      departureDate,
      returnDate,
      seatAvailability,
      price: { amount, currency: 'EUR' },
      offerType,
      uuid: uuid(uuidSeed++),
    })
  }
}

export { flights }
