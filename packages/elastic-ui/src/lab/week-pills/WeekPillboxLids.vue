<script setup lang="ts">
import { computed } from 'vue'
import TextMorph from '../../components/text-morph/TextMorph.vue'
import { summaryOf, weekDays } from './week'

/**
 * Lab: the week as a pill organiser. Seven compartments in a case, each closed by a lid, its day's
 * letter printed on the case below it. Turning a day on, its lid tips open on its hinge and a pill
 * drops in; turning it off, the pill leaves first and the lid comes down after it ("leaving comes
 * before making room").
 * Shut, the case is flat and quiet; what opens takes on material (the lid's underside, a shadow).
 */
const props = withDefaults(defineProps<{ locale?: string; weekStartsOn?: 1 | 7 }>(), { locale: 'en', weekStartsOn: 1 })
const days = defineModel<number[]>({ default: () => [] })

const week = computed(() => weekDays(props.locale, props.weekStartsOn))
const on = (day: number) => days.value.includes(day)
const summary = computed(() => summaryOf(days.value, week.value))
const toggle = (day: number) => (days.value = on(day) ? days.value.filter((d) => d !== day) : [...days.value, day].sort())

const ease = 'ease-[var(--ease-emphasized)] motion-reduce:transition-none'
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-3">
    <TextMorph :text="summary" class="text-label text-fg-secondary" aria-live="polite" />
    <!-- The case: a tray a tone below the page, its compartments sunk into it. Room above it for
         the lids, which stand up past its edge when they open. -->
    <div role="group" aria-label="Days" class="mt-12 flex gap-1 rounded-[var(--radius-xl)] bg-surface-sunk p-1.5 pt-3">
      <button
        v-for="d in week"
        :key="d.day"
        type="button"
        :aria-pressed="on(d.day)"
        :aria-label="d.long"
        class="group flex min-w-0 flex-1 cursor-pointer flex-col items-stretch gap-1 rounded-[var(--radius-md)] focus-ring"
        @click="toggle(d.day)"
      >
        <span class="relative h-14 [perspective:400px]">
          <!-- The compartment, sunk, with its pill. -->
          <span class="absolute inset-0 grid place-items-center overflow-hidden rounded-[var(--radius-md)] bg-bg-inset shadow-[inset_0_1px_3px_rgb(0_0_0/0.15)]">
            <span
              class="flex h-6 w-3 flex-col overflow-hidden rounded-full shadow-[0_1px_2px_rgb(0_0_0/0.25)] transition-[translate,scale,opacity]"
              :class="[ease, on(d.day) ? 'translate-y-0 scale-100 opacity-100 delay-200 duration-300' : '-translate-y-4 scale-75 opacity-0 delay-0 duration-150']"
            >
              <span class="flex-1 bg-[color:var(--color-accent)]" />
              <span class="flex-1 bg-surface-raised" />
            </span>
          </span>
          <!-- The lid, hinged at the top: it tips back to open, showing its underside. -->
          <span
            class="absolute inset-0 origin-top transition-[rotate,translate] [transform-style:preserve-3d]"
            :class="[ease, on(d.day) ? '[rotate:x_118deg] -translate-y-0.5 delay-0 duration-500' : '[rotate:x_0deg] translate-y-0 delay-100 duration-400']"
          >
            <span
              class="absolute inset-0 flex items-end justify-center rounded-[var(--radius-md)] bg-surface-raised pb-1.5 shadow-[0_1px_2px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.5)] [backface-visibility:hidden]"
            >
              <!-- The grip a thumb opens it by. -->
              <span class="h-1 w-4 rounded-full bg-border-strong" />
            </span>
            <span class="absolute inset-0 rounded-[var(--radius-md)] bg-surface [backface-visibility:hidden] [rotate:x_180deg]" />
          </span>
        </span>
        <!-- The day's letter, printed on the case under its compartment. -->
        <span class="text-center text-meta transition-colors duration-300" :class="on(d.day) ? 'text-fg' : 'text-fg-muted group-hover:text-fg-secondary'">{{ d.narrow }}</span>
      </button>
    </div>
  </div>
</template>
