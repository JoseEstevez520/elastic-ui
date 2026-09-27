<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { labelFor } from '../../utils/labels'
import Button from '../button/Button.vue'
import DialogMorph from '../dialog-morph/DialogMorph.vue'
import DialogMorphDescription from '../dialog-morph/DialogMorphDescription.vue'
import DialogMorphTitle from '../dialog-morph/DialogMorphTitle.vue'

/**
 * A question that needs an answer before going on, such as "Delete this practice?": its button
 * grows into it, as DialogMorph's does, and a click outside does not close it. It says what will
 * happen, and offers to go back or to go ahead; with `tone="danger"`, going ahead is in the danger colour,
 * for what cannot be undone. Focus starts on going back.
 */
const props = withDefaults(
  defineProps<{
    title: string
    /** What will happen, and what cannot be undone. */
    description?: string
    /** The button that goes ahead: "Delete". */
    confirmLabel: string
    cancelLabel?: string
    /** `danger`: going ahead cannot be undone, and says so in the danger colour. */
    tone?: 'danger' | 'neutral'
    class?: HTMLAttributes['class']
  }>(),
  { cancelLabel: labelFor('cancel'), tone: 'neutral' },
)
const emit = defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>('open', { default: false })

function confirm(close: () => void) {
  emit('confirm')
  close()
}
</script>

<template>
  <DialogMorph v-model:open="open" alert :class="props.class ?? 'w-[min(26rem,calc(100vw-2rem))]'">
    <template #trigger><slot name="trigger" /></template>
    <template #default="{ close }">
      <DialogMorphTitle>{{ title }}</DialogMorphTitle>
      <DialogMorphDescription v-if="description" class="mt-2">{{ description }}</DialogMorphDescription>
      <slot />
      <div class="mt-6 flex justify-end gap-2">
        <Button variant="ghost" autofocus @click="close">{{ cancelLabel }}</Button>
        <Button :variant="tone === 'danger' ? 'danger' : 'solid'" @click="confirm(close)">{{ confirmLabel }}</Button>
      </div>
    </template>
  </DialogMorph>
</template>
