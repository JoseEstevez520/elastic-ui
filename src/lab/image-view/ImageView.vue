<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { boxOf, useMorphBox } from '../../composables/useMorphBox'
import { XIcon } from '../../icons/internal'

/**
 * Lab: an image that grows into full view where it is. Pressed, the picture itself grows from its
 * place to the whole of it in the middle of the screen, at its own proportions, a real size
 * (useMorphBox): its crop opens out as the box takes the image's shape, the page dimmed behind as
 * under a dialog. Its caption comes into focus under it. Closing (a click, Escape, its cross), the
 * caption goes first, then the picture folds back into its place.
 */
const props = defineProps<{ src: string; alt: string; caption?: string; class?: HTMLAttributes['class'] }>()

const open = ref(false)
const thumb = useTemplateRef<HTMLImageElement>('thumb')
const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')

// The whole picture: as large as fits the screen, with room around it and for its caption, at the
// image's own proportions.
const MARGIN = 32
const CAPTION = 56
function fullBox() {
  const img = thumb.value!
  const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 4 / 3
  const maxW = innerWidth - MARGIN * 2
  const maxH = innerHeight - MARGIN * 2 - (props.caption ? CAPTION : 0)
  const width = Math.min(maxW, maxH * ratio, img.naturalWidth || maxW)
  const height = width / ratio
  return {
    top: (innerHeight - height - (props.caption ? CAPTION : 0)) / 2,
    left: (innerWidth - width) / 2,
    width,
    height,
  }
}

const radius = ref('0px')
const { shown, grown, visible, settled, style } = useMorphBox({
  open,
  from: () => {
    if (thumb.value) radius.value = getComputedStyle(thumb.value).borderRadius
    return boxOf(thumb.value)
  },
  to: fullBox,
  returnFocus: () => thumb.value,
})
const boxStyle = computed(() => style({ borderRadius: [radius.value, '12px'] }))
watch(settled, (isSettled) => isSettled && closeButton.value?.focus({ preventScroll: true }))

useEventListener<KeyboardEvent>(
  () => document,
  'keydown',
  (e) => e.key === 'Escape' && open.value && (open.value = false),
)
</script>

<template>
  <img
    ref="thumb"
    :src="src"
    :alt="alt"
    tabindex="0"
    role="button"
    :aria-label="`${alt}, full view`"
    :class="['cursor-zoom-in focus-ring', shown && 'invisible', props.class]"
    @click="open = true"
    @keydown.enter.prevent="open = true"
  />
  <Teleport to="body">
    <template v-if="shown">
      <div
        :class="[
          'fixed inset-0 z-50 cursor-zoom-out bg-[color:var(--dialog-overlay,rgb(0_0_0/0.55))] transition-opacity duration-300',
          grown ? 'opacity-100' : 'opacity-0',
        ]"
        @click="open = false"
      />
      <div role="dialog" aria-modal="true" :aria-label="alt" class="pointer-events-none fixed inset-0 z-50">
        <!-- The picture itself, its box growing from the thumbnail to the whole of it. -->
        <img
          :src="src"
          alt=""
          class="pointer-events-auto fixed cursor-zoom-out object-cover"
          :style="boxStyle"
          @click="open = false"
        />
        <p
          v-if="caption"
          :class="[
            'fixed inset-x-0 px-6 text-center text-sm text-white/85',
            visible
              ? 'animate-[blur-in_0.45s_var(--ease-soft)_0.3s_both]'
              : 'opacity-0 transition-opacity duration-150',
          ]"
          :style="{ top: `${fullBox().top + fullBox().height + 16}px` }"
        >
          {{ caption }}
        </p>
        <button
          ref="closeButton"
          type="button"
          aria-label="Close"
          :class="[
            'pointer-events-auto fixed top-4 right-4 flex size-9 cursor-pointer items-center justify-center rounded-full text-white/80 hover:text-white focus-ring',
            visible ? 'opacity-100 transition-opacity delay-200 duration-300' : 'opacity-0 duration-150',
          ]"
          @click="open = false"
        >
          <XIcon aria-hidden="true" class="size-5" />
        </button>
      </div>
    </template>
  </Teleport>
</template>
