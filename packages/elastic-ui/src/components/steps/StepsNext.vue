<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ChevronRightIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { useStepsContext, useStepsItem } from './steps.context'
import { stepsNextClass } from './steps.variants'

/** Opens the next step. Not shown in the last one, where there is nothing to go on to. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const { active, ids } = useStepsContext()
const index = useStepsItem()
const labels = useLabels()
</script>

<template>
  <button v-if="index < ids.length - 1" type="button" :class="cn(stepsNextClass, props.class)" @click="active = index + 1">
    <slot>{{ labels.next }}</slot>
    <ChevronRightIcon
      aria-hidden="true"
      class="size-4 transition-transform duration-150 ease-out group-hover/next:translate-x-0.5 motion-reduce:transition-none"
    />
  </button>
</template>
