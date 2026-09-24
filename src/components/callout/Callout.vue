<script setup lang="ts">
import { computed, type Component, type HTMLAttributes } from 'vue'
import { AlertIcon, InfoIcon, LightbulbIcon, OctagonAlertIcon, TriangleAlertIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { calloutVariants } from './callout.variants'

export type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

/**
 * A note set apart from the text around it, as GitHub's `> [!NOTE]` alerts: a note, a tip,
 * something important, a warning or a caution, each with its icon and a soft tint of its colour.
 */
const props = withDefaults(
  defineProps<{
    type?: CalloutType
    /** Defaults to the type's name ("Note", "Tip"…). */
    title?: string
    icon?: Component
    class?: HTMLAttributes['class']
  }>(),
  { type: 'note' },
)

const KINDS: Record<CalloutType, { title: string; icon: Component }> = {
  note: { title: 'Note', icon: InfoIcon },
  tip: { title: 'Tip', icon: LightbulbIcon },
  important: { title: 'Important', icon: AlertIcon },
  warning: { title: 'Warning', icon: TriangleAlertIcon },
  caution: { title: 'Caution', icon: OctagonAlertIcon },
}
const kind = computed(() => KINDS[props.type])
</script>

<template>
  <div role="note" :class="cn(calloutVariants({ type }), props.class)">
    <component :is="icon ?? kind.icon" aria-hidden="true" class="mt-0.5 size-4 text-[color:var(--callout-color)]" />
    <p class="font-medium text-fg">{{ title ?? kind.title }}</p>
    <div v-if="$slots.default" class="col-start-2 mt-1 leading-relaxed text-fg-secondary [&>*+*]:mt-2">
      <slot />
    </div>
  </div>
</template>
