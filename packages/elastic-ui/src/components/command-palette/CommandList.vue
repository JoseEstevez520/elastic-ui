<script setup lang="ts">
import { ListboxContent } from 'reka-ui'
import { onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useCommandPaletteContext } from './command-palette.context'
import { commandListClass, commandListMeasuredClass } from './command-palette.variants'

/** The results, taking their height as they change. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const { settled } = useCommandPaletteContext()

// Measured from the inside, so the box can ease between heights. Unset until measured, so it
// opens at its size instead of growing from nothing.
const inner = useTemplateRef<HTMLElement>('inner')
const height = ref<number>()
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(([entry]) => (height.value = entry.borderBoxSize[0].blockSize))
  if (inner.value) observer.observe(inner.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <ListboxContent
    :style="height === undefined ? undefined : { '--command-list-height': `${height}px` }"
    :class="
      cn(
        commandListClass,
        height !== undefined && commandListMeasuredClass,
        settled ? 'overflow-y-auto' : 'overflow-hidden',
        props.class,
      )
    "
  >
    <div ref="inner" class="p-2">
      <slot />
    </div>
  </ListboxContent>
</template>
