<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAirportSearch } from '~/composables/flights/useAirportSearch'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    inputId: string
    placeholder?: string
    suggestionsListId?: string
  }>(),
  { suggestionsListId: undefined },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = ref(props.modelValue)
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)

watch(() => props.modelValue, (v) => { localValue.value = v })

watch(localValue, (v) => { emit('update:modelValue', v) })

const suggestions = useAirportSearch(localValue)

watch(
  () => [showSuggestions.value, suggestions.value.length],
  ([show, len]) => {
    if (show && len > 0) {
      highlightedIndex.value = 0
    } else {
      highlightedIndex.value = -1
    }
  },
)

function onBlur() {
  setTimeout(() => {
    showSuggestions.value = false
    highlightedIndex.value = -1
  }, 150)
}

function selectSuggestion(value: string) {
  localValue.value = value
  showSuggestions.value = false
  highlightedIndex.value = -1
}

function onKeydown(e: KeyboardEvent) {
  const list = suggestions.value
  if (!showSuggestions.value || list.length === 0) {
    if (e.key === 'Escape') {
      showSuggestions.value = false
      highlightedIndex.value = -1
    }
    return
  }

  const len = list.length

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = highlightedIndex.value < len - 1 ? highlightedIndex.value + 1 : 0
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = highlightedIndex.value <= 0 ? len - 1 : highlightedIndex.value - 1
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    const i = highlightedIndex.value
    if (i >= 0 && i < len) {
      selectSuggestion(list[i].iata)
    }
    return
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    showSuggestions.value = false
    highlightedIndex.value = -1
  }
}

const suggestionsId = props.suggestionsListId ?? `${props.inputId}-suggestions`

function optionId(index: number) {
  return `${suggestionsId}-option-${index}`
}
</script>

<template>
  <label :for="inputId" class="filters__label">{{ label }}</label>
  <div class="filters__autocomplete">
    <input
      :id="inputId"
      v-model="localValue"
      type="text"
      role="combobox"
      class="filters__input"
      :placeholder="placeholder"
      autocomplete="off"
      aria-autocomplete="list"
      :aria-controls="suggestionsId"
      :aria-expanded="showSuggestions && suggestions.length > 0"
      :aria-activedescendant="highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined"
      @focus="showSuggestions = true"
      @blur="onBlur"
      @keydown="onKeydown"
    />
    <ul
      v-if="showSuggestions && suggestions.length > 0"
      :id="suggestionsId"
      class="filters__suggestions"
      role="listbox"
      :aria-label="label + ' suggestions'"
    >
      <li
        v-for="(s, i) in suggestions"
        :key="s.iata"
        :id="optionId(i)"
        role="option"
        class="filters__suggestion"
        :class="{ 'filters__suggestion--highlighted': i === highlightedIndex }"
        :aria-selected="i === highlightedIndex"
        @mousedown="selectSuggestion(s.iata)"
      >
        {{ s.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.filters__label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
}

.filters__input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--color-neutral-900);
  background: var(--color-white);
  transition: border-color var(--transition-default);
  box-sizing: border-box;
  min-height: 44px;
  -webkit-appearance: none;
  appearance: none;
  font-family: inherit;
}

.filters__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(228, 0, 58, 0.12);
}

.filters__input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.filters__autocomplete {
  position: relative;
}

.filters__suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-white);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-card);
  list-style: none;
  margin: 0;
  padding: var(--space-xs) 0;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.filters__suggestion {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-neutral-900);
  cursor: pointer;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.filters__suggestion:hover,
.filters__suggestion--highlighted {
  background: var(--color-neutral-50);
  color: var(--color-primary);
}
</style>
