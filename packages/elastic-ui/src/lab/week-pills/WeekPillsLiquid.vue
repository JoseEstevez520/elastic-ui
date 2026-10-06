<script setup lang="ts">
import { computed } from 'vue'
import Liquid from '../../components/liquid/Liquid.vue'
import TextMorph from '../../components/text-morph/TextMorph.vue'
import { summaryOf, weekDays } from './week'

/**
 * Lab: the week as pills of colour. A day that is on grows into a drop; two days side by side join
 * into one capsule (a bridge stretches across and the Liquid melts them together), so a run of days
 * reads as one shape: Monday to Friday is one long pill, the weekend apart. A day that is off is an
 * empty ring, a place for a pill.
 */
const props = withDefaults(defineProps<{ locale?: string; weekStartsOn?: 1 | 7 }>(), { locale: 'en', weekStartsOn: 1 })
const days = defineModel<number[]>({ default: () => [] })

const week = computed(() => weekDays(props.locale, props.weekStartsOn))
const on = (day: number) => days.value.includes(day)
const summary = computed(() => summaryOf(days.value, week.value))
// Each pair of neighbours that are both on, by the index of the first.
const bridges = computed(() => week.value.slice(0, -1).map((d, i) => on(d.day) && on(week.value[i + 1]!.day)))

const toggle = (day: number) => (days.value = on(day) ? days.value.filter((d) => d !== day) : [...days.value, day].sort())
const column = (i: number) => ({ left: `calc(${i} * 100% / 7)`, width: 'calc(100% / 7)' })
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-3">
    <TextMorph :text="summary" class="text-label text-fg-secondary" aria-live="polite" />
    <div class="relative h-12">
      <!-- Empty places: a faint ring where each day's pill would sit. -->
      <div v-for="(d, i) in week" :key="`ring-${d.day}`" class="absolute inset-y-0 p-1" :style="column(i)">
        <div class="size-full rounded-full border border-dashed border-border-strong" />
      </div>

      <Liquid fill="var(--color-accent)" :reach="5" class="absolute inset-0">
        <template #shapes>
          <div
            v-for="(d, i) in week"
            :key="`pill-${d.day}`"
            class="absolute inset-y-0 p-1 transition-[scale] duration-500 ease-[var(--ease-emphasized)] motion-reduce:transition-none"
            :style="{ ...column(i), scale: on(d.day) ? 1 : 0 }"
          >
            <div class="size-full rounded-full bg-black" />
          </div>
          <!-- A bridge from one day's middle to the next's: grown once both are on, it melts them
               into one capsule; shrunk first when one goes, so the capsule thins and lets go. -->
          <div
            v-for="(joined, i) in bridges"
            :key="`bridge-${i}`"
            class="absolute inset-y-1 bg-black transition-[scale] duration-500 ease-[var(--ease-emphasized)] motion-reduce:transition-none"
            :class="joined ? 'delay-150' : 'delay-0'"
            :style="{ left: `calc(${i + 0.5} * 100% / 7)`, width: 'calc(100% / 7)', scale: joined ? '1 1' : '0 1' }"
          />
        </template>
      </Liquid>

      <div role="group" aria-label="Days" class="absolute inset-0 flex">
        <button
          v-for="d in week"
          :key="d.day"
          type="button"
          :aria-pressed="on(d.day)"
          :aria-label="d.long"
          class="relative flex flex-1 cursor-pointer items-center justify-center rounded-full text-label transition-colors duration-300 focus-ring"
          :class="on(d.day) ? 'text-[color:var(--color-accent-fg)]' : 'text-fg-muted hover:text-fg'"
          @click="toggle(d.day)"
        >
          {{ d.narrow }}
        </button>
      </div>
    </div>
  </div>
</template>
