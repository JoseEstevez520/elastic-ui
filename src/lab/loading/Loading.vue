<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { EASE_EMPHASIZED, EASE_SOFT, prefersReducedMotion } from '../../utils/motion'

/**
 * Lab: loading that becomes its content. While `loading`, the placeholder (its slot) shows still
 * shapes in the surface's tone, roughly where the content will be: no grey pulse. When the content
 * arrives, each shape stretches to the real size and place of the piece it stood for (a real size,
 * as the library's morphs: its box eases, it is never scaled), and the piece comes into focus
 * inside it as the shape fades, as a wave. The box holding them eases to the content's height.
 *
 * A shape and its piece are paired by `data-shape="name"` on both; pieces with no shape just come
 * into focus.
 */
const props = defineProps<{ loading: boolean; class?: HTMLAttributes['class'] }>()

const root = useTemplateRef<HTMLElement>('root')
const placeholder = useTemplateRef<HTMLElement>('placeholder')
const content = useTemplateRef<HTMLElement>('content')
const layer = useTemplateRef<HTMLElement>('layer')
// Shown: the placeholder while loading, then both for the change, then the content alone.
const showPlaceholder = ref(props.loading)
const showContent = ref(!props.loading)

const DURATION = 520
const easing = `cubic-bezier(${EASE_EMPHASIZED.join(',')})`

watch(
  () => props.loading,
  async (loading) => {
    if (loading) {
      showContent.value = false
      showPlaceholder.value = true
      return
    }
    const box = root.value!
    const from = box.getBoundingClientRect()
    // The shapes, where they are, before the content is laid out beside them.
    const shapes = [...(placeholder.value?.querySelectorAll<HTMLElement>('[data-shape]') ?? [])].map((el) => ({
      name: el.dataset.shape!,
      rect: el.getBoundingClientRect(),
      radius: getComputedStyle(el).borderRadius,
    }))
    showContent.value = true
    await nextTick()
    const pieces = [...(content.value?.querySelectorAll<HTMLElement>('[data-shape]') ?? [])]
    const blocks = [...(content.value?.children ?? [])] as HTMLElement[]
    showPlaceholder.value = false
    await nextTick()
    if (prefersReducedMotion()) return

    // The box eases from the placeholder's height to the content's.
    const to = box.getBoundingClientRect()
    box.animate([{ height: `${from.height}px` }, { height: `${to.height}px` }], { duration: DURATION, easing })

    // Each shape, copied onto a layer above, stretches from where it was to its piece's box.
    const origin = to
    for (const shape of shapes) {
      const piece = pieces.find((p) => p.dataset.shape === shape.name)
      if (!piece) continue
      const r = piece.getBoundingClientRect()
      const ghost = document.createElement('div')
      ghost.className = 'absolute bg-surface'
      Object.assign(ghost.style, {
        left: `${shape.rect.left - origin.left}px`,
        top: `${shape.rect.top - origin.top}px`,
        width: `${shape.rect.width}px`,
        height: `${shape.rect.height}px`,
        borderRadius: shape.radius,
      })
      layer.value!.appendChild(ghost)
      const target = {
        left: `${r.left - origin.left}px`,
        top: `${r.top - origin.top}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
        // A piece with rounded corners (a photo) gives the shape its own; text, which has none,
        // keeps the shape's, so the shape never sharpens into a box on its way.
        borderRadius: ['', '0px'].includes(getComputedStyle(piece).borderRadius)
          ? shape.radius
          : getComputedStyle(piece).borderRadius,
      }
      ghost
        .animate([{}, target], { duration: DURATION, easing, fill: 'forwards' })
        .finished.then(
          () =>
            ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'linear', fill: 'forwards' })
              .finished,
        )
        .then(() => ghost.remove())
    }
    // The pieces come into focus as the shapes arrive under them, as a wave.
    blocks.forEach((el, i) =>
      el.animate(
        [
          { opacity: 0, filter: 'blur(2px)' },
          { opacity: 1, filter: 'blur(0px)' },
        ],
        {
          duration: 450,
          delay: DURATION * 0.55 + Math.min(i, 7) * 40,
          easing: `cubic-bezier(${EASE_SOFT.join(',')})`,
          fill: 'backwards',
        },
      ),
    )
  },
)
</script>

<template>
  <div ref="root" :class="['relative overflow-hidden', props.class]" :aria-busy="loading">
    <div v-if="showPlaceholder" ref="placeholder" aria-hidden="true">
      <slot name="placeholder" />
    </div>
    <div v-if="showContent" ref="content">
      <slot />
    </div>
    <!-- The shapes on their way to their pieces. -->
    <div ref="layer" aria-hidden="true" class="pointer-events-none absolute inset-0" />
  </div>
</template>
