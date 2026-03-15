<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'

type DisabledRange = { start: string; end: string }

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    inputId: string
    disabled?: boolean
    minDate?: Date | null
    maxDate?: Date | null
    disabledDates?: ((date: Date) => boolean) | DisabledRange[]
  }>(),
  { disabled: false, minDate: null, maxDate: null, disabledDates: () => [] },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const datePickerRef = ref<InstanceType<typeof import('v-calendar').DatePicker> | null>(null)
const DatePickerComponent = ref<typeof import('v-calendar').DatePicker | null>(null)
const calendarLoading = ref(false)

watch(showPicker, async (open) => {
  if (open && !DatePickerComponent.value && !calendarLoading.value) {
    calendarLoading.value = true
    try {
      const [calendarMod] = await Promise.all([
        import('v-calendar'),
        import('v-calendar/style.css'),
      ])
      DatePickerComponent.value = calendarMod.DatePicker
    } finally {
      calendarLoading.value = false
    }
  }
})

function dateToLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isDateDisabled(date: Date): boolean {
  const d = dateToLocalYYYYMMDD(date)
  if (props.minDate && date < props.minDate) return true
  if (props.maxDate && date > props.maxDate) return true
  const ranges = props.disabledDates
  if (typeof ranges === 'function') return ranges(date)
  if (!Array.isArray(ranges) || ranges.length === 0) return false
  return (ranges as DisabledRange[]).some(
    (r) => r.start <= d && d <= r.end,
  )
}

function addDays(date: Date, n: number): Date {
  const out = new Date(date)
  out.setDate(out.getDate() + n)
  return out
}

function getFirstEnabledDateInMonth(anchor: Date): Date | null {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const copy = new Date(d)
    if (!isDateDisabled(copy)) return copy
  }
  return null
}

function getNextEnabledDate(from: Date): Date | null {
  let d = addDays(from, 1)
  const limit = props.maxDate ?? new Date(from.getFullYear() + 1, 11, 31)
  while (d <= limit) {
    if (!isDateDisabled(d)) return d
    d = addDays(d, 1)
  }
  return null
}

function getPrevEnabledDate(from: Date): Date | null {
  let d = addDays(from, -1)
  const limit = props.minDate ?? new Date(from.getFullYear() - 1, 0, 1)
  while (d >= limit) {
    if (!isDateDisabled(d)) return d
    d = addDays(d, -1)
  }
  return null
}

function focusDayEl(date: Date) {
  nextTick(() => {
    const str = dateToLocalYYYYMMDD(date)
    const el = popoverRef.value?.querySelector(
      `.id-${str} .vc-day-content`,
    ) as HTMLElement | null
    el?.focus()
  })
}

function getDateFromFocusedDay(): Date | null {
  const el = document.activeElement as HTMLElement | null
  if (!el?.classList?.contains('vc-day-content')) return null
  const dayRow = el.closest('.vc-day')
  if (!dayRow) return null
  const idClass = [...dayRow.classList].find((c) => /^id-\d{4}-\d{2}-\d{2}$/.test(c))
  if (!idClass) return null
  const dateStr = idClass.slice(3)
  return new Date(dateStr + 'T12:00:00')
}

function focusFirstEnabledDay() {
  const anchor = dateModel.value || new Date()
  const toFocus =
    dateModel.value && !isDateDisabled(dateModel.value)
      ? dateModel.value
      : getFirstEnabledDateInMonth(anchor)
  if (!toFocus) return
  const picker = datePickerRef.value as { move?: (t: Date) => Promise<boolean> } | null
  picker?.move?.(toFocus).then(() => focusDayEl(toFocus))
}

watch(
  () => [showPicker.value, calendarLoading.value],
  ([show, loading]) => {
    if (show && !loading) {
      nextTick(() => {
        nextTick(focusFirstEnabledDay)
      })
    }
  },
)

function onPopoverKeydown(e: KeyboardEvent) {
  if (!popoverRef.value?.contains(document.activeElement as Node)) return
  const target = document.activeElement as HTMLElement
  if (!target?.classList?.contains('vc-day-content')) return

  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault()
    const current = getDateFromFocusedDay()
    if (!current) return
    let next: Date | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = getNextEnabledDate(current)
    } else {
      next = getPrevEnabledDate(current)
    }
    if (!next) return
    const picker = datePickerRef.value as { move?: (t: Date) => Promise<boolean> } | null
    picker?.move?.(next).then(() => focusDayEl(next!))
    return
  }

  if (e.key === 'Enter') {
    if (target.classList.contains('vc-disabled')) return
    const date = getDateFromFocusedDay()
    if (date) {
      e.preventDefault()
      dateModel.value = date
      onPicked()
    }
  }
}

const dateModel = computed({
  get: () => (props.modelValue ? new Date(props.modelValue + 'T12:00:00') : null),
  set: (val: Date | null) => {
    emit('update:modelValue', val ? dateToLocalYYYYMMDD(val) : '')
  },
})

const triggerAriaLabel = computed(() => {
  const visibleText = props.modelValue ? formatDisplay(props.modelValue) : 'dd.mm.yyyy'
  return `${props.label}, ${visibleText}`
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
      :aria-label="triggerAriaLabel"
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
    <div
      ref="popoverRef"
      v-if="showPicker"
      class="filters__datepicker-popover"
      @keydown.capture="onPopoverKeydown"
    >
      <div v-if="calendarLoading" class="filters__datepicker-loading" aria-hidden="true">
        <span class="filters__datepicker-loading-text">Loading…</span>
      </div>
      <template v-else-if="DatePickerComponent">
        <component
          ref="datePickerRef"
          :is="DatePickerComponent"
          v-model="dateModel"
          :min-date="minDate"
          :max-date="maxDate"
          :disabled-dates="disabledDates"
          @dayclick="(_, event) => (event?.target as HTMLElement)?.blur()"
          @update:model-value="onPicked"
        />
      </template>
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

.filters__datepicker-trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
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

.filters__datepicker-loading {
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 280px;
  min-height: 280px;
}

.filters__datepicker-loading-text {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

@media (max-width: 480px) {
  .filters__datepicker-popover {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin-top: 0;
    width: fit-content;
    max-width: calc(100vw - 2 * var(--space-md));
  }
}
</style>
