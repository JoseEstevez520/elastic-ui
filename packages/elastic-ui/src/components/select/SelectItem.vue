<script setup lang="ts">
import { ListboxItem, ListboxItemIndicator } from 'reka-ui'
import { onBeforeUnmount, onMounted, useTemplateRef, type HTMLAttributes } from 'vue'
import { CheckIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useSelect } from './select.context'
import { selectItemClass } from './select.variants'

const props = defineProps<{
  value: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()
const select = useSelect()

// Its text, for SelectValue to show once it is chosen.
const text = useTemplateRef<HTMLElement>('text')
onMounted(() => select.texts.set(props.value, text.value?.textContent?.trim() ?? props.value))
onBeforeUnmount(() => select.texts.delete(props.value))
</script>

<template>
  <ListboxItem :value="value" :disabled="disabled" :class="cn(selectItemClass, props.class)">
    <ListboxItemIndicator class="absolute left-2.5 flex items-center">
      <CheckIcon aria-hidden="true" class="size-3.5" />
    </ListboxItemIndicator>
    <span ref="text"><slot /></span>
  </ListboxItem>
</template>
