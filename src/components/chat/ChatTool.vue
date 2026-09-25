<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui'
import { computed, inject, onBeforeUnmount, ref, useSlots, type Component, type HTMLAttributes } from 'vue'
import { AlertIcon, ChevronRightIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { disclosureContentClass } from '../collapsible/collapsible.variants'
import IconSwap from '../icon-swap/IconSwap.vue'
import StatusText from '../status-text/StatusText.vue'
import { ChatMessageStepsKey, ChatThreadReadyKey } from './chat.keys'
import { chatToolTriggerClass } from './chat.variants'

/**
 * One step the answer took, such as a search, told in a single line that evolves with it. While
 * it runs the line shimmers ("Searching the web"); done, its words morph into what it found
 * ("Read 3 sources"), and if there is more to see a chevron fades in and the line opens to show
 * it (ChatSources, as a wave). Put it in ChatMessage's `before` slot, one per step.
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
// Only a finished step with something to show opens.
const expandable = computed(() => props.state === 'done' && !!slots.default)

// A step arriving in a conversation already on screen comes into focus; one there when the
// conversation opened just shows.
const arrived = inject(ChatThreadReadyKey, ref(true)).value

// Its message stops saying it is thinking: this line says what is going on instead.
const steps = inject(ChatMessageStepsKey, null)
if (steps) steps.value++
onBeforeUnmount(() => steps && steps.value--)
</script>

<template>
  <CollapsibleRoot
    v-model:open="open"
    :disabled="!expandable"
    :unmount-on-hide="false"
    :class="cn('mb-3 text-sm', arrived && 'animate-[blur-in_0.45s_var(--ease-soft)_both] motion-reduce:animate-none', props.class)"
  >
    <CollapsibleTrigger :class="chatToolTriggerClass">
      <!-- Failing, the icon turns into the alert as the words turn into what went wrong, both in the
           danger colour and at the same pace (see StatusText). -->
      <IconSwap
        v-if="icon || state === 'error'"
        :icon="state === 'error' ? AlertIcon : icon!"
        :class="
          cn(
            'transition-colors duration-350 ease-emphasized motion-reduce:transition-none',
            state === 'error' ? 'text-[color:var(--color-danger)]' : 'text-fg-muted',
          )
        "
      />
      <StatusText
        :text="label"
        :working="state === 'running'"
        :error="state === 'error'"
        :class="[state !== 'running' && 'text-fg-muted', expandable && 'group-hover/tool:text-fg']"
      />
      <ChevronRightIcon
        aria-hidden="true"
        :class="[
          'size-3.5 text-fg-faint transition-[opacity,rotate] duration-300 ease-emphasized motion-reduce:transition-none',
          expandable ? 'opacity-100' : 'opacity-0',
          open && 'rotate-90',
        ]"
      />
    </CollapsibleTrigger>
    <CollapsibleContent v-if="$slots.default" :class="disclosureContentClass">
      <!-- What it holds brings its own entrance (ChatSources comes in as a wave); it only leaves here. -->
      <div class="pt-2 pb-1 [[data-state=closed]>&]:animate-content-out motion-reduce:animate-none">
        <slot />
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>
