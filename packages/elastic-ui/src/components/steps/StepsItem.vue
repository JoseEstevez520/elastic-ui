<script setup lang="ts">
import { computed, onBeforeUnmount, useId, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import Collapsible from '../collapsible/Collapsible.vue'
import CollapsibleContent from '../collapsible/CollapsibleContent.vue'
import CollapsibleTrigger from '../collapsible/CollapsibleTrigger.vue'
import { provideStepsItem, useStepsContext } from './steps.context'
import {
  stepsContentClass,
  stepsItemClass,
  stepsLineClass,
  stepsLineFillClass,
  stepsNumberVariants,
  stepsTitleClass,
  stepsTriggerClass,
  type StepsNumberState,
} from './steps.variants'

/** One step: its number, its title, and what it says. */
const props = defineProps<{
  title?: string
  class?: HTMLAttributes['class']
}>()

defineSlots<{
  default?(): unknown
  /** Replaces `title`, for a title with more than text. */
  title?(): unknown
}>()

const { active, isStatic, ids } = useStepsContext()

// Items count themselves in as they set up, which is the order they appear in.
const id = useId()
ids.value.push(id)
onBeforeUnmount(() => ids.value.splice(ids.value.indexOf(id), 1))

const index = computed(() => ids.value.indexOf(id))
const isLast = computed(() => index.value === ids.value.length - 1)
const isOpen = computed(() => active.value === index.value)
provideStepsItem(index)

const state = computed<StepsNumberState>(() =>
  isStatic.value ? 'static' : index.value <= active.value ? 'reached' : 'upcoming',
)

// Closing the open step would leave none; it stays, and only opening another moves on.
function onOpen(open: boolean) {
  if (open) active.value = index.value
}
</script>

<template>
  <li :aria-current="!isStatic && isOpen ? 'step' : undefined" :class="cn(stepsItemClass, props.class)">
    <div class="flex flex-col items-center">
      <span aria-hidden="true" :class="stepsNumberVariants({ state })">{{ index + 1 }}</span>
      <span v-if="!isLast" aria-hidden="true" :class="stepsLineClass">
        <span v-if="!isStatic" :class="cn(stepsLineFillClass, index < active ? 'scale-y-100' : 'scale-y-0')" />
      </span>
    </div>

    <div v-if="isStatic" :class="cn('min-w-0', !isLast && 'pb-6')">
      <div :class="stepsTitleClass">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="$slots.default" :class="cn(stepsContentClass, 'text-fg-secondary')">
        <slot />
      </div>
    </div>

    <Collapsible v-else :open="isOpen" :class="cn('min-w-0', !isLast && 'pb-6')" @update:open="onOpen">
      <CollapsibleTrigger :chevron="false" :class="stepsTriggerClass">
        <slot name="title">{{ title }}</slot>
      </CollapsibleTrigger>
      <CollapsibleContent :class="stepsContentClass">
        <slot />
      </CollapsibleContent>
    </Collapsible>
  </li>
</template>
