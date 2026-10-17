<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import TextMorph from '../../components/text-morph/TextMorph.vue'
import { prefersReducedMotion } from '../../utils/motion'

/**
 * Lab: a date as a tear-off calendar, after the day-a-page calendars and their animations. A small
 * block: the month on a band a tone deeper, bound along its top, and the day in large figures on
 * the page under it. Moving on, the day's page lifts over the binding and is gone, the next one
 * already beneath; going back, the earlier page comes down over the binding onto it. A new month
 * morphs on the band (TextMorph). The page is split from the band by tone, not a line. A page
 * stays opaque as it turns, as paper does, and is gone once it passes edge-on (its back is hidden).
 */
const props = withDefaults(defineProps<{ date: string; locale?: string }>(), { locale: 'en' })

const parse = (iso: string) => new Date(`${iso}T00:00:00`)
const month = computed(() => parse(props.date).toLocaleDateString(props.locale, { month: 'short' }).replace('.', ''))
const dayOf = (iso: string) => parse(iso).getDate()

interface Sheet {
  id: number
  day: number
  /** `lifting` leaves over the binding; `lowering` comes down onto the pile. */
  phase: 'still' | 'lifting' | 'lowering'
}
let next = 0
const sheets = ref<Sheet[]>([{ id: next++, day: dayOf(props.date), phase: 'still' }])
const TURN = 420
let timers: ReturnType<typeof setTimeout>[] = []
onBeforeUnmount(() => timers.forEach(clearTimeout))

watch(
  () => props.date,
  (now, before) => {
    const day = dayOf(now)
    const top = sheets.value[sheets.value.length - 1]!
    if (prefersReducedMotion()) return void (sheets.value = [{ id: next++, day, phase: 'still' }])
    if (now > before) {
      // The new page is already under the old one, which lifts away.
      sheets.value = [
        { id: next++, day, phase: 'still' },
        { ...top, phase: 'lifting' },
      ]
      timers.push(setTimeout(() => (sheets.value = sheets.value.filter((s) => s.phase !== 'lifting')), TURN))
    } else {
      // The earlier page comes back down over the binding onto the one showing.
      const back: Sheet = { id: next++, day, phase: 'lowering' }
      sheets.value = [{ ...top, phase: 'still' }, back]
      timers.push(setTimeout(() => (sheets.value = [{ ...back, phase: 'still' }]), TURN))
    }
  },
)
</script>

<template>
  <div
    class="relative inline-flex h-[52px] w-11 flex-col overflow-visible rounded-[10px] bg-surface-raised text-fg [perspective:220px]"
    role="img"
    :aria-label="parse(date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })"
  >
    <!-- The band the pages are bound to. -->
    <div class="relative z-10 flex h-[18px] shrink-0 items-center justify-center rounded-t-[10px] bg-surface-sunk">
      <TextMorph :text="month" class="text-meta leading-none font-medium text-fg-muted" />
    </div>
    <!-- The pile of pages: the one showing, and one turning over the binding. -->
    <div class="relative flex-1 [transform-style:preserve-3d]">
      <div
        v-for="sheet in sheets"
        :key="sheet.id"
        :class="[
          'absolute inset-0 flex origin-top items-center justify-center rounded-b-[10px] bg-surface-raised [backface-visibility:hidden]',
          'text-title tabular-nums motion-reduce:transition-none',
          sheet.phase === 'lifting' &&
            'transition-[rotate] duration-[420ms] ease-in [rotate:x_100deg] starting:[rotate:x_0deg]',
          sheet.phase === 'lowering' &&
            'transition-[rotate] duration-[420ms] ease-out [rotate:x_0deg] starting:[rotate:x_100deg]',
        ]"
      >
        {{ sheet.day }}
      </div>
    </div>
  </div>
</template>
