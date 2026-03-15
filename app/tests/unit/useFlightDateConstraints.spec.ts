import { describe, it, expect, vi } from 'vitest'
import { ref, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import {
  addDaysStr,
  buildDisabledRanges,
  useFlightDateConstraints,
} from '~/composables/flights/useFlightDateConstraints'
import type { Flight } from '#shared/types/flight'

describe('addDaysStr', () => {
  it('adds days correctly within same month', () => {
    expect(addDaysStr('2026-04-10', 5)).toBe('2026-04-15')
    expect(addDaysStr('2026-04-03', 0)).toBe('2026-04-03')
  })

  it('handles month boundary', () => {
    expect(addDaysStr('2026-04-28', 5)).toBe('2026-05-03')
  })

  it('handles year boundary', () => {
    expect(addDaysStr('2026-12-30', 3)).toBe('2027-01-02')
  })

  it('subtracts days when given negative offset', () => {
    expect(addDaysStr('2026-04-10', -3)).toBe('2026-04-07')
    expect(addDaysStr('2026-05-01', -1)).toBe('2026-04-30')
  })
})

describe('buildDisabledRanges', () => {
  const minStr = '2026-04-01'
  const maxStr = '2026-04-30'

  it('returns empty array for empty enabled set', () => {
    expect(buildDisabledRanges(new Set(), minStr, maxStr)).toEqual([])
  })

  it('returns correct ranges for a single enabled date', () => {
    const enabled = new Set(['2026-04-15'])
    expect(buildDisabledRanges(enabled, minStr, maxStr)).toEqual([
      { start: '2026-04-01', end: '2026-04-14' },
      { start: '2026-04-16', end: '2026-04-30' },
    ])
  })

  it('returns correct ranges for non-contiguous enabled dates', () => {
    const enabled = new Set(['2026-04-05', '2026-04-20'])
    expect(buildDisabledRanges(enabled, minStr, maxStr)).toEqual([
      { start: '2026-04-01', end: '2026-04-04' },
      { start: '2026-04-06', end: '2026-04-19' },
      { start: '2026-04-21', end: '2026-04-30' },
    ])
  })

  it('returns no disabled ranges when all dates in range are contiguous and enabled', () => {
    const enabled = new Set(['2026-04-01', '2026-04-02', '2026-04-03'])
    expect(buildDisabledRanges(enabled, minStr, maxStr)).toEqual([
      { start: '2026-04-04', end: '2026-04-30' },
    ])
  })

  it('filters enabled dates to those within minStr and maxStr', () => {
    const enabled = new Set(['2026-03-15', '2026-04-10', '2026-05-01'])
    expect(buildDisabledRanges(enabled, minStr, maxStr)).toEqual([
      { start: '2026-04-01', end: '2026-04-09' },
      { start: '2026-04-11', end: '2026-04-30' },
    ])
  })
})

describe('useFlightDateConstraints', () => {
  const mockFlights: Flight[] = [
    {
      origin: 'DUS',
      destination: 'BCN',
      departureDate: '2026-04-05',
      returnDate: '2026-04-12',
      seatAvailability: 5,
      price: { amount: 99, currency: 'EUR' },
      offerType: 'ExactMatch',
      uuid: 'a',
    },
    {
      origin: 'DUS',
      destination: 'BCN',
      departureDate: '2026-04-10',
      returnDate: '2026-04-17',
      seatAvailability: 3,
      price: { amount: 120, currency: 'EUR' },
      offerType: 'amadeusBestPrice',
      uuid: 'b',
    },
    {
      origin: 'HAM',
      destination: 'FCO',
      departureDate: '2026-04-08',
      returnDate: '2026-04-15',
      seatAvailability: 2,
      price: { amount: 80, currency: 'EUR' },
      offerType: 'ExactMatch',
      uuid: 'c',
    },
  ]

  const TestWrapper = defineComponent({
    setup() {
      const origin = ref('')
      const destination = ref('')
      const departureDate = ref('')
      const constraints = useFlightDateConstraints(origin, destination, departureDate)
      return {
        origin,
        destination,
        departureDate,
        ...constraints,
      }
    },
    render: () => h('div'),
  })

  function mountWithStore(flights: Flight[] = mockFlights) {
    return mount(TestWrapper, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: { flights: { flights } },
          }),
        ],
      },
    })
  }

  it('canSelectDates is false when origin has less than 3 chars', () => {
    const wrapper = mountWithStore()
    expect(wrapper.vm.canSelectDates).toBe(false)
    wrapper.vm.origin = 'DU'
    wrapper.vm.destination = 'BCN'
    return wrapper.vm.$nextTick().then(() => {
      expect(wrapper.vm.canSelectDates).toBe(false)
    })
  })

  it('canSelectDates is false when destination has less than 3 chars', () => {
    const wrapper = mountWithStore()
    wrapper.vm.origin = 'DUS'
    wrapper.vm.destination = 'BC'
    return wrapper.vm.$nextTick().then(() => {
      expect(wrapper.vm.canSelectDates).toBe(false)
    })
  })

  it('canSelectDates is true when both origin and destination have at least 3 chars', async () => {
    const wrapper = mountWithStore()
    wrapper.vm.origin = 'DUS'
    wrapper.vm.destination = 'BCN'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.canSelectDates).toBe(true)
  })

  it('availableDepartureDatesForRoute filters flights by exact origin and destination match', async () => {
    const wrapper = mountWithStore()
    wrapper.vm.origin = 'DUS'
    wrapper.vm.destination = 'BCN'
    await wrapper.vm.$nextTick()
    const set = wrapper.vm.availableDepartureDatesForRoute as Set<string>
    expect(Array.from(set).sort()).toEqual(['2026-04-05', '2026-04-10'])
  })

  it('availableDepartureDatesForRoute returns empty set when canSelectDates is false', async () => {
    const wrapper = mountWithStore()
    wrapper.vm.origin = 'DU'
    wrapper.vm.destination = 'BC'
    await wrapper.vm.$nextTick()
    const set = wrapper.vm.availableDepartureDatesForRoute as Set<string>
    expect(Array.from(set)).toEqual([])
  })

  it('availableReturnDatesForRoute filters by route and selected departure date', async () => {
    const wrapper = mountWithStore()
    wrapper.vm.origin = 'DUS'
    wrapper.vm.destination = 'BCN'
    wrapper.vm.departureDate = '2026-04-05'
    await wrapper.vm.$nextTick()
    const set = wrapper.vm.availableReturnDatesForRoute as Set<string>
    expect(Array.from(set)).toEqual(['2026-04-12'])
  })

  it('availableReturnDatesForRoute returns all return dates for route when no departure selected', async () => {
    const wrapper = mountWithStore()
    wrapper.vm.origin = 'DUS'
    wrapper.vm.destination = 'BCN'
    await wrapper.vm.$nextTick()
    const set = wrapper.vm.availableReturnDatesForRoute as Set<string>
    expect(Array.from(set).sort()).toEqual(['2026-04-12', '2026-04-17'])
  })

  it('disabledDepartureDatesRanges returns empty when canSelectDates is false', async () => {
    const wrapper = mountWithStore()
    wrapper.vm.origin = 'DU'
    wrapper.vm.destination = 'BC'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.disabledDepartureDatesRanges).toEqual([])
  })

  it('disabledDepartureDatesRanges returns correct ranges when canSelectDates is true', async () => {
    const wrapper = mountWithStore()
    wrapper.vm.origin = 'DUS'
    wrapper.vm.destination = 'BCN'
    await wrapper.vm.$nextTick()
    const ranges = wrapper.vm.disabledDepartureDatesRanges as { start: string; end: string }[]
    expect(ranges.length).toBeGreaterThan(0)
    expect(ranges.every((r) => r.start <= r.end)).toBe(true)
    const depSet = wrapper.vm.availableDepartureDatesForRoute as Set<string>
    ranges.forEach((range) => {
      const start = new Date(range.start).getTime()
      const end = new Date(range.end).getTime()
      for (const d of depSet) {
        const t = new Date(d).getTime()
        expect(t < start || t > end).toBe(true)
      }
    })
  })
})
