<script setup lang="ts">
import { ListboxContent, ListboxRoot } from 'reka-ui'
import { nextTick, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useSelect } from './select.context'

/**
 * The options, in the panel the field grows into, coming into focus as a wave from the field
 * down. Picking one closes it and gives the focus back to the field (with `multiple`, it stays
 * open to pick more).
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const select = useSelect()
const root = useTemplateRef<{ highlightSelected: () => Promise<void> }>('root')
const list = useTemplateRef<InstanceType<typeof ListboxContent>>('list')

// Opening puts the focus in the list, on the chosen option, so the keys work at once; closing from
// inside gives it back to the field.
watch(select.open, async (open) => {
  const el = (list.value?.$el as HTMLElement | undefined) ?? undefined
  if (!open) {
    if (el?.contains(document.activeElement)) select.trigger.value?.focus({ preventScroll: true })
    return
  }
  await nextTick()
  root.value?.highlightSelected()
})

function onPick(next: unknown) {
  select.value.value = next as string | string[]
  if (!select.multiple.value) {
    select.open.value = false
    select.trigger.value?.focus({ preventScroll: true })
  }
}
</script>

<template>
  <Teleport defer :to="select.panel.value" :disabled="!select.panel.value">
    <ListboxRoot
      ref="root"
      :model-value="select.value.value"
      :multiple="select.multiple.value"
      highlight-on-hover
      class="border-t border-[color:var(--color-border)] text-ui text-fg"
      @update:model-value="onPick"
    >
      <!-- A list long enough to scroll opens on the chosen option, maybe mid-list, where a wave
           counted from the first would land all at once; there the panel's own entrance is enough. -->
      <ListboxContent
        :id="select.contentId"
        ref="list"
        :class="
          cn(
            'stagger-items max-h-72 overflow-y-auto overscroll-contain p-1 outline-none scrollbar-subtle [--stagger-delay:0.05s] [&:has(>:nth-child(9))>*]:animate-none',
            props.class,
          )
        "
      >
        <slot />
      </ListboxContent>
    </ListboxRoot>
  </Teleport>
</template>
