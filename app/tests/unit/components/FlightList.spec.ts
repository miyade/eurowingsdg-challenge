import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import FlightList from '~/components/flights/FlightList.vue'
import type { Flight } from '#shared/types/flight'

function mockFlight(index: number): Flight {
  return {
    origin: 'DUS',
    destination: 'BCN',
    departureDate: '2026-04-03',
    returnDate: '2026-04-10',
    seatAvailability: 5,
    price: { amount: 99, currency: 'EUR' },
    offerType: 'ExactMatch',
    uuid: `test-uuid-${index}`,
  }
}

function mountList(storeOverride: Record<string, unknown> = {}) {
  return mount(FlightList, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            flights: {
              isLoading: false,
              error: null,
              flights: [],
              filters: {
                origin: 'DUS',
                destination: 'BCN',
                departureDate: '2026-04-03',
                returnDate: '2026-04-10',
                offerType: undefined,
                lowSeatsOnly: undefined,
                maxPrice: undefined,
              },
              sortKey: 'none',
              ...storeOverride,
            },
          },
        }),
      ],
      stubs: {
        FlightCard: { template: '<div class="flight-card-stub" />' },
      },
    },
  })
}

describe('FlightList', () => {
  it('renders skeleton cards when loading', () => {
    const wrapper = mountList({ isLoading: true, flights: [] })
    expect(wrapper.findAll('.skeleton-card')).toHaveLength(4)
    expect(wrapper.find('.flight-card-stub').exists()).toBe(false)
  })

  it('renders empty state when no flights match', () => {
    const wrapper = mountList({ isLoading: false, flights: [] })
    expect(wrapper.find('.flight-list__empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('No flights found')
    expect(wrapper.find('.flight-card-stub').exists()).toBe(false)
  })

  it('renders correct number of flight cards', () => {
    const wrapper = mountList({
      isLoading: false,
      flights: [mockFlight(1), mockFlight(2), mockFlight(3)],
    })
    expect(wrapper.findAll('.flight-card-stub')).toHaveLength(3)
  })

  it('result count is in an aria-live region', () => {
    const wrapper = mountList({
      isLoading: false,
      flights: [mockFlight(1), mockFlight(2), mockFlight(3)],
    })
    const count = wrapper.find('.flight-list__count')
    expect(count.attributes('aria-live')).toBe('polite')
    expect(count.text()).toContain('3')
  })
})
