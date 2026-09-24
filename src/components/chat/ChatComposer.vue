<script setup lang="ts">
import { computed, ref, useId, type HTMLAttributes } from 'vue'
import { ChevronRightIcon, StopIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import IconSwap from '../icon-swap/IconSwap.vue'
import { composerButtonClass, composerFieldClass } from './chat.variants'

/**
 * Where the conversation is written, as in Curio: a filled pill with a round button of the same
 * fill. At rest the two read as one; focused or holding text, the pill makes room and the button
 * pulls out of it like a drop, its chevron fading in. Enter sends, Shift+Enter starts a new line, and while
 * the answer comes (`responding`) the chevron turns into stop.
 */
const props = withDefaults(
  defineProps<{
    placeholder?: string
    /** The answer is on its way: send turns into stop. */
    responding?: boolean
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  { placeholder: 'Ask anything…', label: 'Message' },
)
const emit = defineEmits<{ send: [text: string]; stop: [] }>()

const text = defineModel<string>({ default: '' })
const focused = ref(false)

const ready = computed(() => text.value.trim().length > 0)
const active = computed(() => focused.value || ready.value || props.responding)

function send() {
  if (props.responding || !ready.value) return
  const sent = text.value.trim()
  text.value = ''
  emit('send', sent)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  send()
}

const press = () => (props.responding ? emit('stop') : send())

// The goo: blurring the pill and the button together and cutting the blur back to a hard edge
// turns the gap between them into a liquid neck, so the button pulls out of the pill as a drop
// rather than just moving aside. The sharp originals are drawn back on top, so text never blurs.
const goo = `${useId()}-goo`
</script>

<template>
  <form :class="cn('mx-auto w-full max-w-2xl px-4 pt-2 pb-5', props.class)" @submit.prevent="press">
    <div class="relative flex items-end" :style="{ filter: `url(#${goo})` }">
      <textarea
        v-model="text"
        rows="1"
        :aria-label="label"
        :placeholder="placeholder"
        :class="composerFieldClass"
        :style="{ marginRight: active ? '52px' : '0px' }"
        @focus="focused = true"
        @blur="focused = false"
        @keydown="onKeydown"
      />
      <!-- Under the pill's end at rest, so the two read as one; out beside it once active. -->
      <div
        class="absolute right-0 bottom-0 transition-[translate] duration-500 ease-glide motion-reduce:transition-none"
        :style="{ translate: active ? '0 0' : '-4px 0' }"
      >
        <button
          type="submit"
          :aria-label="responding ? 'Stop' : 'Send'"
          :aria-disabled="(!responding && !ready) || undefined"
          :class="[composerButtonClass, active && 'hover:bg-accent hover:text-accent-fg']"
        >
          <IconSwap
            :icon="responding ? StopIcon : ChevronRightIcon"
            :class="[
              'size-4 transition-opacity motion-reduce:transition-none',
              active ? 'opacity-100 delay-150 duration-300' : 'opacity-0 duration-150',
            ]"
          />
        </button>
      </div>
    </div>

    <svg aria-hidden="true" class="absolute size-0">
      <defs>
        <filter :id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  </form>
</template>
