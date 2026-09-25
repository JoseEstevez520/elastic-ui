<script setup lang="ts">
import { computed, onBeforeUnmount, useId, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import CodeBlock from '../code-block/CodeBlock.vue'
import { useCodeWalkthroughContext } from './code-walkthrough.context'
import { codeWalkthroughStepVariants } from './code-walkthrough.variants'

/** One step of a CodeWalkthrough: what it says, and the whole code as it stands after it. */
const props = defineProps<{
  /** The whole code at this step, not only what changes. */
  code: string
  /** The file it is in, named above the code. */
  file?: string
  /** The lines this step is about, such as "3-5, 9"; by default, the lines it adds. */
  highlight?: string
  title?: string
  class?: HTMLAttributes['class']
}>()

const { steps, active } = useCodeWalkthroughContext()
const el = useTemplateRef<HTMLElement>('el')

// Steps count themselves in as they set up, which is the order they appear in.
const id = useId()
steps.value.push({ id, el: () => el.value ?? undefined, code: () => props.code, file: () => props.file, highlight: () => props.highlight })
onBeforeUnmount(() => {
  steps.value = steps.value.filter((step) => step.id !== id)
})

const isActive = computed(() => steps.value[active.value]?.id === id)
</script>

<template>
  <section ref="el" :aria-current="isActive ? 'step' : undefined" :class="cn('min-w-0', props.class)">
    <h3 v-if="title" :class="codeWalkthroughStepVariants({ part: 'title', active: isActive })">{{ title }}</h3>
    <div :class="codeWalkthroughStepVariants({ part: 'body', active: isActive })">
      <slot />
    </div>
    <!-- On a narrow screen there is no code beside the steps: each carries its own. -->
    <CodeBlock :code="code" :title="file" class="mt-4 lg:hidden" />
  </section>
</template>
