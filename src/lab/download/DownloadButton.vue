<script setup lang="ts">
import { onBeforeUnmount, computed, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import Button from '../../components/button/Button.vue'
import type { ButtonVariants } from '../../components/button/button.variants'
import { amountVariants, progressOutcomeText } from '../../components/progress-button/progress-button.variants'
import TextMorph from '../../components/text-morph/TextMorph.vue'
import DownloadTray from './DownloadTray.vue'

/**
 * Lab: ProgressButton's life (Download → Downloading 40% → Downloaded, and back), with its icon
 * telling the progress and the end instead of a fill behind the label: one thing leads.
 */
const props = withDefaults(
  defineProps<{
    label?: string
    workingLabel?: string
    doneLabel?: string
    errorLabel?: string
    progress?: number
    variant?: ButtonVariants['variant']
    class?: HTMLAttributes['class']
  }>(),
  {
    label: 'Download',
    workingLabel: 'Downloading',
    doneLabel: 'Downloaded',
    errorLabel: "Couldn't download",
    variant: 'outline',
  },
)
const state = defineModel<'idle' | 'working' | 'done' | 'error'>('state', { default: 'idle' })
const emit = defineEmits<{ click: [event: MouseEvent] }>()

const RESULT_SHOWN = 2000
let back: ReturnType<typeof setTimeout> | undefined
watch(state, (now) => {
  clearTimeout(back)
  if (now === 'done' || now === 'error') back = setTimeout(() => (state.value = 'idle'), RESULT_SHOWN)
})
onBeforeUnmount(() => clearTimeout(back))

const working = computed(() => state.value === 'working')
const phase = computed(
  () =>
    ({ idle: props.label, working: props.workingLabel, done: props.doneLabel, error: props.errorLabel })[state.value],
)
const amount = computed(() => Math.round(Math.min(100, Math.max(0, props.progress ?? 0))))
</script>

<template>
  <Button
    :variant="variant"
    :aria-busy="working || undefined"
    :class="cn(state === 'error' && progressOutcomeText.error, props.class)"
    @click="state === 'idle' && emit('click', $event)"
  >
    <span class="inline-flex items-center gap-2">
      <DownloadTray :state="state" :progress="progress" />
      <TextMorph :text="phase" />
    </span>
    <span
      v-if="progress !== undefined"
      :aria-hidden="!working || undefined"
      :class="amountVariants({ shown: working })"
    >
      {{ amount }}%
    </span>
  </Button>
</template>
