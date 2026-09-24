<script setup lang="ts">
import { computed, ref, useId, type HTMLAttributes } from 'vue'
import { ChevronRightIcon, StopIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import IconSwap from '../icon-swap/IconSwap.vue'
import { composerButtonClass, composerDropClass, composerFieldClass, composerShapeClass } from './chat.variants'
import { labelFor, useLabels } from '../../utils/labels'

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
  { placeholder: labelFor('messagePlaceholder'), label: labelFor('message') },
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

// The goo: the pill and the button are drawn as plain shapes on a layer of their own, blurred
// together and cut back to a hard edge, so the gap between them becomes a liquid neck and the
// button pulls out of the pill as a drop. The result is filled with the composer's colour, which
// may be translucent (over an Aurora), and only then shadowed; the text and the icon sit above,
// never filtered.
const goo = `${useId()}-goo`
const labels = useLabels()
</script>

<template>
  <form :class="cn('mx-auto w-full max-w-2xl px-4 pt-2 pb-5', props.class)" @submit.prevent="press">
    <div class="relative flex items-end">
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0"
        :style="{ filter: `url(#${goo}) var(--chat-composer-shadow,)` }"
      >
        <div :class="composerShapeClass" class="absolute inset-y-0 left-0 rounded-3xl" :style="{ right: active ? '52px' : '0px' }" />
        <div class="absolute right-0 bottom-0 size-11 rounded-full bg-black" :class="composerDropClass" :style="{ translate: active ? '0 0' : '-4px 0' }" />
      </div>
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
      <div :class="composerDropClass" class="absolute right-0 bottom-0" :style="{ translate: active ? '0 0' : '-4px 0' }">
        <button
          type="submit"
          :aria-label="responding ? labels.stop : labels.send"
          :aria-disabled="(!responding && !ready) || undefined"
          :class="[composerButtonClass, active && 'hover:text-accent']"
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
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 20 -9" result="shape" />
          <feFlood style="flood-color: var(--chat-composer-bg, var(--color-bg-muted))" result="fill" />
          <feComposite in="fill" in2="shape" operator="in" />
        </filter>
      </defs>
    </svg>
  </form>
</template>
