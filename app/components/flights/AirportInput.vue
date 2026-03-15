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

watch(() => props.modelValue, (v) => { localValue.value = v })

watch(localValue, (v) => { emit('update:modelValue', v) })

const suggestions = useAirportSearch(localValue)

function onBlur() {
  setTimeout(() => { showSuggestions.value = false }, 150)
}

function selectSuggestion(value: string) {
  localValue.value = value
  showSuggestions.value = false
}

const suggestionsId = props.suggestionsListId ?? `${props.inputId}-suggestions`
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
      @focus="showSuggestions = true"
      @blur="onBlur"
    />
    <ul
      v-if="showSuggestions && suggestions.length > 0"
      :id="suggestionsId"
      class="filters__suggestions"
      role="listbox"
      :aria-label="label + ' suggestions'"
    >
      <li
        v-for="s in suggestions"
        :key="s.iata"
        role="option"
        class="filters__suggestion"
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

.filters__suggestion:hover {
  background: var(--color-neutral-50);
  color: var(--color-primary);
}
</style>
