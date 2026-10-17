<script setup lang="ts">
import { computed, type Component, type HTMLAttributes } from 'vue'
import { AlertIcon, InfoIcon, LightbulbIcon, OctagonAlertIcon, TriangleAlertIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { calloutVariants } from './callout.variants'

export type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

/**
 * A note set apart from the text around it, as GitHub's `> [!NOTE]` alerts: a note, a tip,
 * something important, a warning or a caution, each with its icon and a soft tint of its colour.
 */
const props = withDefaults(
  defineProps<{
    type?: CalloutType
    /** Defaults to the type's name ("Note", "Tip"…, see `ElasticUi` labels). */
    title?: string
    icon?: Component
    class?: HTMLAttributes['class']
  }>(),
  { type: 'note' },
)

const ICONS: Record<CalloutType, Component> = {
  note: InfoIcon,
  tip: LightbulbIcon,
  important: AlertIcon,
  warning: TriangleAlertIcon,
  caution: OctagonAlertIcon,
}
const labels = useLabels()
const defaultTitle = computed(() => labels[props.type])
</script>

<template>
  <div role="note" :class="cn(calloutVariants({ type }), props.class)">
    <component :is="icon ?? ICONS[type]" aria-hidden="true" class="mt-0.5 size-4 text-[color:var(--callout-color)]" />
    <p class="font-medium text-fg">{{ title ?? defaultTitle }}</p>
    <div v-if="$slots.default" class="col-start-2 mt-1 leading-relaxed text-fg-secondary [&>*+*]:mt-2">
      <slot />
    </div>
  </div>
</template>
