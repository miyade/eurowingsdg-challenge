
/** 
   * keeping these outside of the functions as it would become expensive
   * when recreated everytime functions are called
*/
const priceFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})
/** 
   * for eur we use the pre built formatter
   * anything else we make new one
*/
export function formatPrice(amount: number, currency: string): string {
  if (currency === 'EUR') {
    return priceFormatter.format(amount)
  }
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount)
}
// e.g. takes 2026-03-14 and returns 13 Mar 2026
export function formatDate(dateString: string): string {
  return dateFormatter.format(new Date(dateString))
}

export function getTripDuration(departureDate: string, returnDate: string): number {
  const departure = Date.UTC(
    +departureDate.slice(0, 4),
    +departureDate.slice(5, 7) - 1,
    +departureDate.slice(8, 10),
  )
  const returnD = Date.UTC(
    +returnDate.slice(0, 4),
    +returnDate.slice(5, 7) - 1,
    +returnDate.slice(8, 10),
  )
  const days = Math.round((returnD - departure) / (1000 * 60 * 60 * 24))
  return Math.max(1, days)
}
