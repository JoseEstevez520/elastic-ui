<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui'
import { computed, inject, onBeforeUnmount, onMounted, ref, useSlots, type Component, type HTMLAttributes } from 'vue'
import { ChevronRightIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { afterPaint } from '../../utils/motion'
import StatusText from '../status-text/StatusText.vue'
import { ChatMessageKey, ChatThreadReadyKey } from './chat.keys'
import { chatToolContentClass, chatToolTriggerClass } from './chat.variants'

/**
 * One step the answer took, such as a search, told in a single line that evolves with it. While
 * it runs the line shimmers ("Searching the web"); done, its words morph into what it found
 * ("Read 3 sources"), and if there is more to see a chevron fades in and the line opens to show
 * it (ChatSources, as a wave). Failing, it says so just as quietly, since the answer goes on
 * without it, and opens to what went wrong (ChatToolDetail). The first step of an answer takes
 * over its thinking line. Put it in ChatMessage's `before` slot, one per step.
 */
const props = withDefaults(
  defineProps<{
    /** What the step is doing, then what it did: change it as the step goes on, and it morphs. */
    label: string
    state?: 'running' | 'done' | 'error'
    icon?: Component
    class?: HTMLAttributes['class']
  }>(),
  { state: 'running' },
)

const open = defineModel<boolean>('open', { default: false })
const slots = useSlots()
// Only a finished step with something to show opens: what it found, or what went wrong. A step
// failing is no failure of the answer, which goes on without it, so it stays as quiet as the rest.
const expandable = computed(() => props.state !== 'running' && !!slots.default)

// A step arriving in a conversation already on screen comes into focus; one there when the
// conversation opened just shows.
const arrived = inject(ChatThreadReadyKey, ref(true)).value

// The first step of an answer still thinking takes over its thinking line: it starts from those
// words, where they stood, and morphs into its own, the text sliding over to make room for the icon
// as it comes into focus. Thinking becomes searching, rather than one line leaving as another comes.
const message = inject(ChatMessageKey, null)
const from = message && message.steps.value === 0 ? message.thinking.value : undefined
if (message) message.steps.value++
onBeforeUnmount(() => message && message.steps.value--)

const becoming = ref(!!from)
onMounted(() => from && afterPaint(() => (becoming.value = false)))
const text = computed(() => (becoming.value ? from! : props.label))
</script>

<template>
  <CollapsibleRoot
    v-model:open="open"
    :disabled="!expandable"
    :unmount-on-hide="false"
    :class="cn('mb-3', arrived && !from && 'animate-blur-in motion-reduce:animate-none', props.class)"
  >
    <CollapsibleTrigger :class="chatToolTriggerClass">
      <component
        :is="icon"
        v-if="icon"
        aria-hidden="true"
        :class="
          cn('size-4 shrink-0 text-fg-muted', from && 'animate-[blur-in_0.35s_var(--ease-soft)_both] motion-reduce:animate-none')
        "
      />
      <!-- Starts over the icon's place, where the thinking line's words stood (an icon and the gap). -->
      <span
        :class="[
          'flex min-w-0 transition-[translate] duration-350 ease-emphasized motion-reduce:transition-none',
          becoming && icon && '-translate-x-6',
        ]"
      >
        <StatusText
          :text="text"
          :working="state === 'running'"
          :class="[state !== 'running' && 'text-fg-muted', expandable && 'group-hover/tool:text-fg']"
        />
      </span>
      <ChevronRightIcon
        aria-hidden="true"
        :class="[
          'size-3.5 text-fg-faint transition-[opacity,rotate] duration-300 ease-emphasized motion-reduce:transition-none',
          expandable ? 'opacity-100' : 'opacity-0',
          open && 'rotate-90',
        ]"
      />
    </CollapsibleTrigger>
    <CollapsibleContent
      v-if="$slots.default"
      :class="chatToolContentClass"
    >
      <!-- What it holds brings its own entrance (ChatSources comes in as a wave); it only leaves here.
           Failing, it holds what went wrong. -->
      <div class="pt-2 pb-1 [[data-state=closed]>&]:animate-[blur-out_0.35s_var(--ease-soft)_both] motion-reduce:animate-none">
        <slot />
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>
