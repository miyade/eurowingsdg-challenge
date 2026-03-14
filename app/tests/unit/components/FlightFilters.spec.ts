import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed } from 'vue'
import type { Ref } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import FlightFilters from '~/components/flights/FlightFilters.vue'
import { useFlightsStore } from '~/stores/flights'

vi.mock('~/composables/flights/useAirportSearch', () => ({
  useAirportSearch: (query: Ref<string>) => computed(() =>
    query.value.length >= 2
      ? [{ iata: 'DUS', label: 'DUS — Düsseldorf Airport, Germany' }]
      : []
  ),
}))

const initialState = {
  flights: {
    flights: [
      { origin: 'DUS', destination: 'BCN' },
      { origin: 'HAM', destination: 'FCO' },
    ],
  },
}

function mountFilters() {
  return mount(FlightFilters, {
    global: {
      plugins: [createTestingPinia({ initialState, createSpy: vi.fn })],
    },
  })
}

describe('FlightFilters', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mountFilters()
  })

  it('clear button is not visible when no filters are active', () => {
    expect(wrapper.find('.filters__clear').exists()).toBe(false)
  })

  it('clear button appears after typing in origin input', async () => {
    const input = wrapper.find('#filter-origin')
    await input.setValue('D')
    expect(wrapper.find('.filters__clear').exists()).toBe(true)
  })

  it('autocomplete suggestions appear when typing a matching origin', async () => {
    const input = wrapper.find('#filter-origin')
    await input.setValue('DU')
    await input.trigger('focus')
    const suggestions = wrapper.find('#origin-suggestions')
    expect(suggestions.exists()).toBe(true)
    expect(suggestions.text()).toContain('DUS')
  })

  it('selecting a suggestion sets the input value and hides suggestions', async () => {
    const input = wrapper.find('#filter-origin')
    await input.setValue('DU')
    await input.trigger('focus')
    const suggestions = wrapper.find('#origin-suggestions')
    expect(suggestions.exists()).toBe(true)
    const suggestion = suggestions.findAll('li').find(li => li.text().includes('DUS'))
    expect(suggestion).toBeDefined()
    await suggestion!.trigger('mousedown')
    expect((wrapper.find('#filter-origin').element as HTMLInputElement).value).toBe('DUS')
    expect(wrapper.find('#origin-suggestions').exists()).toBe(false)
  })

  it('store setFilters is called when origin input changes', async () => {
    const store = useFlightsStore()
    const input = wrapper.find('#filter-origin')
    await input.setValue('DUS')
    expect(store.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ origin: 'DUS' }),
    )
  })
})
