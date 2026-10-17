<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useCarousel } from './carousel.context'
import { carouselItemClass } from './carousel.variants'

/** One slide of a Carousel: a photo (an ImageView, to open it where it is), a card, anything. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const carousel = useCarousel('CarouselItem')
const el = useTemplateRef<HTMLElement>('el')
onMounted(() => el.value && carousel.register(el.value))
onBeforeUnmount(() => el.value && carousel.unregister(el.value))

const index = computed(() => (el.value ? carousel.slides.value.indexOf(el.value) : -1))
// Only the slides wholly in view can be reached; the others come in as it moves.
const inView = computed(() => index.value >= carousel.visible.value.from && index.value <= carousel.visible.value.to)
const label = computed(
  () => `${carousel.slideLabel} ${index.value + 1} ${carousel.ofLabel} ${carousel.slides.value.length}`,
)
</script>

<template>
  <div
    ref="el"
    role="group"
    aria-roledescription="slide"
    :aria-label="label"
    :aria-hidden="!inView || undefined"
    :inert="!inView || undefined"
    :class="cn(carouselItemClass, props.class)"
  >
    <slot />
  </div>
</template>
