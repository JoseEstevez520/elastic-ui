<script setup lang="ts">
import { ref, toRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { provideStepsContext } from './steps.context'

/**
 * Numbered steps joined by a line. By default one step is open at a time, opening in place as a
 * Collapsible does, and the line fills down to it as you go on (Material's vertical stepper).
 * `static` shows every step at once, as a guide's steps in docs (Mintlify, Fumadocs).
 */
const props = defineProps<{
  /** Every step shown, none to open: the line and numbers are only a guide. */
  static?: boolean
  class?: HTMLAttributes['class']
}>()

/** The open step, from 0. */
const active = defineModel<number>({ default: 0 })

const ids = ref<string[]>([])
provideStepsContext({ active, isStatic: toRef(props, 'static'), ids })
</script>

<template>
  <ol :class="cn('flex flex-col', props.class)">
    <slot />
  </ol>
</template>
