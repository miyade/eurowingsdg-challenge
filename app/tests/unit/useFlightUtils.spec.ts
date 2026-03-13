import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate, getTripDuration } from '~/composables/flights/useFlightUtils'

describe('formatPrice', () => {
  // \u00a0 for non breaking space instead of normal space 
  it('formats EUR amount correctly using German locale', () => {
    expect(formatPrice(89.50, 'EUR')).toBe('89,50\u00a0€')
  })

  it('formats a round number correctly', () => {
    expect(formatPrice(100, 'EUR')).toBe('100,00\u00a0€')
  })

  it('handles non-EUR currency without crashing', () => {
    expect(() => formatPrice(50, 'USD')).not.toThrow()
  })
})

describe('formatDate', () => {
  it("formats '2026-04-03' as '03 Apr 2026'", () => {
    expect(formatDate('2026-04-03')).toBe('03 Apr 2026')
  })

  it("formats '2026-12-25' as '25 Dec 2026'", () => {
    expect(formatDate('2026-12-25')).toBe('25 Dec 2026')
  })
})

describe('getTripDuration', () => {
  it('returns 7 for a 7-day trip', () => {
    expect(getTripDuration('2026-04-03', '2026-04-10')).toBe(7)
  })

  it('returns 1 for same-day departure and return', () => {
    expect(getTripDuration('2026-04-03', '2026-04-03')).toBe(1)
  })

  it('returns 1 as minimum even if return is before departure', () => {
    expect(getTripDuration('2026-04-10', '2026-04-03')).toBe(1)
  })
})
