<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    inputId: string
    disabled?: boolean
    minDate?: Date | null
    maxDate?: Date | null
    disabledDates?: ((date: Date) => boolean) | object[]
  }>(),
  { disabled: false, minDate: null, maxDate: null, disabledDates: () => [] },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

function dateToLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const dateModel = computed({
  get: () => (props.modelValue ? new Date(props.modelValue + 'T12:00:00') : null),
  set: (val: Date | null) => {
    emit('update:modelValue', val ? dateToLocalYYYYMMDD(val) : '')
  },
})

function formatDisplay(str: string): string {
  if (!str) return ''
  const d = new Date(str + 'T12:00:00')
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

function onPicked() {
  nextTick(() => { showPicker.value = false })
}

function onDocumentClick(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    showPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="wrapperRef" class="filters__datepicker-wrapper">
    <label :for="inputId" class="filters__label">{{ label }}</label>
    <button
      :id="inputId"
      type="button"
      class="filters__input filters__datepicker-trigger"
      :class="{
        'filters__datepicker-trigger--active': modelValue,
        'filters__datepicker-trigger--disabled': disabled,
      }"
      :aria-label="label"
      aria-haspopup="dialog"
      :aria-expanded="showPicker"
      :disabled="disabled"
      @click="!disabled && (showPicker = !showPicker)"
    >
      <span>{{ modelValue ? formatDisplay(modelValue) : 'dd.mm.yyyy' }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </button>
    <div v-if="showPicker" class="filters__datepicker-popover">
      <DatePicker
        v-model="dateModel"
        :min-date="minDate"
        :max-date="maxDate"
        :disabled-dates="disabledDates"
        @dayclick="(_, event) => (event?.target as HTMLElement)?.blur()"
        @update:model-value="onPicked"
      />
    </div>
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

.filters__datepicker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  text-align: left;
  cursor: pointer;
  color: var(--color-neutral-500);
}

.filters__datepicker-trigger--active {
  color: var(--color-neutral-900);
}

.filters__datepicker-trigger--disabled {
  background: var(--color-neutral-100);
  cursor: not-allowed;
  opacity: 0.7;
}

.filters__datepicker-popover {
  --vc-accent-600: #E4003A;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  z-index: 100;
  background: var(--color-white);
  border: 1.5px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
</style>
