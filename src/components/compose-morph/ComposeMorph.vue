<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type Component } from 'vue'
import Textarea from '../input/Textarea.vue'
import PopoverMorph from '../popover-morph/PopoverMorph.vue'
import type { ProgressButtonState } from '../progress-button/ProgressButton.vue'
import ComposeSend from './ComposeSend.vue'
import { labelFor, useLabels } from '../../utils/labels'

export interface Composed {
  message: string
  /** The index of the chosen rating, or undefined when none was chosen. */
  rating?: number
}

/**
 * A button that becomes a small form for writing something short: a comment, a reply, a note,
 * feedback. It holds a message, an optional rating and a quiet send button that turns into its
 * own progress. Once sent, the panel turns into a thank-you and folds back into the button by
 * itself. `submit` does the sending; if it fails, the message stays for another try.
 */
const props = withDefaults(
  defineProps<{
    submit: (composed: Composed) => Promise<unknown>
    label?: string
    placeholder?: string
    /** Rating choices, from worst to best, such as emoji faces for feedback. None by default. */
    ratings?: string[]
    sendLabel?: string
    sendingLabel?: string
    sentLabel?: string
    errorLabel?: string
    thanks?: string
    /** The send button's icon; a chevron by default. ⌘↵ sends too. */
    sendIcon?: Component
    align?: 'start' | 'end'
    side?: 'bottom' | 'top'
  }>(),
  {
    label: labelFor('comment'),
    placeholder: labelFor('commentPlaceholder'),
    ratings: () => [],
    sendLabel: labelFor('send'),
    sendingLabel: labelFor('sending'),
    sentLabel: labelFor('sent'),
    errorLabel: labelFor('sendError'),
    thanks: 'Sent, thanks!',
    align: 'start',
    side: 'bottom',
  },
)

const open = ref(false)
const message = ref('')
const rating = ref<number>()
const sending = ref<ProgressButtonState>('idle')
const thanked = ref(false)

// How long "Sent" shows before the thank-you, the thank-you before it folds back, and a failure
// before the form is ready again; and when, once closed, the form is emptied: after the panel
// has folded away (PopoverMorph closes in 300ms), never under the reader.
const SENT_SHOWN = 700
const THANKS_SHOWN = 1600
const ERROR_SHOWN = 2000
const FOLDED = 350
let timers: ReturnType<typeof setTimeout>[] = []
const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms))

async function submit() {
  sending.value = 'working'
  try {
    await props.submit({ message: message.value.trim(), rating: rating.value })
    sending.value = 'done'
    later(() => (thanked.value = true), SENT_SHOWN)
    later(() => (open.value = false), SENT_SHOWN + THANKS_SHOWN)
  } catch {
    sending.value = 'error'
    later(() => (sending.value = 'idle'), ERROR_SHOWN)
  }
}

// Closed, it starts over.
watch(open, (isOpen) => {
  if (isOpen) return
  timers.forEach(clearTimeout)
  timers = []
  later(() => {
    message.value = ''
    rating.value = undefined
    sending.value = 'idle'
    thanked.value = false
  }, FOLDED)
})
onBeforeUnmount(() => timers.forEach(clearTimeout))

const hasMessage = computed(() => message.value.trim().length > 0)
const canSend = computed(() => hasMessage.value && sending.value === 'idle')
const submitForm = () => canSend.value && submit()
const labels = useLabels()
</script>

<template>
  <PopoverMorph v-model:open="open" :label="label" :align="align" :side="side" class="[--popover-width:20rem]">
    <template #trigger>{{ label }}</template>

    <!-- The panel is sized to what it holds, so turning into the thank-you morphs it smaller. -->
    <p v-if="thanked" class="py-2 text-center text-sm text-fg">{{ thanks }}</p>
    <form v-else class="flex flex-col gap-3" @submit.prevent="submitForm">
      <!-- Bare: the panel already frames it, and a box inside a box is one too many. -->
      <Textarea
        v-model="message"
        bare
        :placeholder="placeholder"
        :aria-label="label"
        class="min-h-24"
        @keydown.enter.meta.prevent="submitForm"
        @keydown.enter.ctrl.prevent="submitForm"
      />
      <div class="flex items-center justify-between gap-3">
        <div v-if="ratings.length" role="radiogroup" :aria-label="labels.rating" class="flex gap-1">
          <button
            v-for="(face, i) in ratings"
            :key="i"
            type="button"
            role="radio"
            :aria-checked="rating === i"
            :aria-label="`${i + 1} of ${ratings.length}`"
            :class="[
              'flex size-8 cursor-pointer items-center justify-center rounded-full text-base transition-[opacity,background-color] duration-150',
              'focus-visible:outline-2 focus-visible:outline-accent',
              rating === undefined || rating === i ? 'opacity-100' : 'opacity-40 hover:opacity-80',
              rating === i && 'bg-bg-muted',
            ]"
            @click="rating = rating === i ? undefined : i"
          >{{ face }}</button>
        </div>
        <div class="ml-auto">
          <ComposeSend
            :state="sending"
            :ready="hasMessage"
            :labels="{ idle: sendLabel, working: `${sendingLabel}…`, done: sentLabel, error: errorLabel }"
            :icon="sendIcon"
            @send="submitForm"
          />
        </div>
      </div>
    </form>
  </PopoverMorph>
</template>
