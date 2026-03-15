import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Flight } from '#shared/types/flight'
import FlightCard from '~/components/flights/FlightCard.vue'

const mockFlight: Flight = {
  origin: 'DUS',
  destination: 'BCN',
  departureDate: '2026-04-03',
  returnDate: '2026-04-10',
  seatAvailability: 5,
  price: { amount: 112.99, currency: 'EUR' },
  offerType: 'ExactMatch',
  uuid: 'test-uuid-1',
}

describe('FlightCard', () => {
  it('renders origin and destination', () => {
    const wrapper = mount(FlightCard, { props: { flight: mockFlight } })
    expect(wrapper.text()).toContain('DUS')
    expect(wrapper.text()).toContain('BCN')
  })

  it('renders formatted price', () => {
    const wrapper = mount(FlightCard, { props: { flight: mockFlight } })
    expect(wrapper.text()).toContain('112,99')
    expect(wrapper.text()).toContain('€')
  })

  it('renders trip duration', () => {
    const wrapper = mount(FlightCard, { props: { flight: mockFlight } })
    expect(wrapper.text()).toContain('7 days')
  })

  it('does not show Best price badge for ExactMatch', () => {
    const wrapper = mount(FlightCard, { props: { flight: mockFlight } })
    expect(wrapper.text()).not.toContain('Best price')
    expect(wrapper.find('.flight-card--best-price').exists()).toBe(false)
  })

  it('shows Best price badge and modifier class for amadeusBestPrice', () => {
    const wrapper = mount(FlightCard, {
      props: { flight: { ...mockFlight, offerType: 'amadeusBestPrice' } },
    })
    expect(wrapper.text()).toContain('Best price')
    expect(wrapper.find('.flight-card--best-price').exists()).toBe(true)
  })

  it('does not show availability warning when seats >= 3', () => {
    const wrapper = mount(FlightCard, { props: { flight: mockFlight } })
    expect(wrapper.find('.flight-availability').exists()).toBe(false)
  })

  it('shows availability warning when seats < 3', () => {
    const wrapper = mount(FlightCard, {
      props: { flight: { ...mockFlight, seatAvailability: 2 } },
    })
    const warning = wrapper.find('.flight-availability')
    expect(warning.exists()).toBe(true)
    expect(warning.text()).toContain('2')
  })
})
