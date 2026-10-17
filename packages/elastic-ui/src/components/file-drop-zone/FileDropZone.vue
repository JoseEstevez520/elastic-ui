<script setup lang="ts">
import { computed, ref, type HTMLAttributes } from 'vue'
import { UploadIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { fileDropZoneLayerClass } from './file-drop-zone.variants'

/**
 * A region of the page that takes files dropped anywhere over it. Nothing shows at rest, and it
 * takes no part in the page's text selection or typing; while files are held over it, a quiet
 * layer comes into focus saying it will take them, and goes when they are let go or leave. Other
 * drags (text, a link) are left alone. With `paste`, files pasted while the focus is inside it
 * (Ctrl+V in an editor) are taken the same way. Both arrive as `add`.
 */
const props = withDefaults(
  defineProps<{
    /** The layer's words, while files are held over. */
    label?: string
    /** Also take files pasted inside it. */
    paste?: boolean
    disabled?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { label: labelFor('dropToAttach') },
)

const emit = defineEmits<{
  /** Files dropped or pasted. */
  add: [files: File[]]
}>()

// Entering and leaving fire for every element inside, so they are counted rather than toggled.
const depth = ref(0)
const over = computed(() => depth.value > 0)

const holdsFiles = (event: DragEvent) => !props.disabled && !!event.dataTransfer?.types.includes('Files')

function onEnter(event: DragEvent) {
  if (!holdsFiles(event)) return
  event.preventDefault()
  depth.value++
}
function onLeave(event: DragEvent) {
  if (holdsFiles(event)) depth.value = Math.max(0, depth.value - 1)
}
function onOver(event: DragEvent) {
  // Without this the browser would not allow a drop here.
  if (holdsFiles(event)) event.preventDefault()
}
function onDrop(event: DragEvent) {
  if (!holdsFiles(event)) return
  event.preventDefault()
  depth.value = 0
  const files = [...(event.dataTransfer?.files ?? [])]
  if (files.length) emit('add', files)
}
function onPaste(event: ClipboardEvent) {
  if (!props.paste || props.disabled) return
  const files = [...(event.clipboardData?.files ?? [])]
  if (!files.length) return
  event.preventDefault()
  emit('add', files)
}
</script>

<template>
  <div
    :class="cn('relative', props.class)"
    @dragenter="onEnter"
    @dragleave="onLeave"
    @dragover="onOver"
    @drop="onDrop"
    @paste="onPaste"
  >
    <slot />
    <Transition
      enter-active-class="transition-[opacity,filter] duration-[250ms] ease-out motion-reduce:transition-none"
      leave-active-class="transition-[opacity,filter] duration-[200ms] ease-in motion-reduce:transition-none"
      enter-from-class="opacity-0 blur-[2px]"
      leave-to-class="opacity-0"
    >
      <div v-if="over" aria-hidden="true" :class="fileDropZoneLayerClass">
        <UploadIcon class="size-5" />
        <span>{{ label }}</span>
      </div>
    </Transition>
  </div>
</template>
