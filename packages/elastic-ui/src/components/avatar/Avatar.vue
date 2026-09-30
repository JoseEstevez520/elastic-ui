<script setup lang="ts">
import { computed, ref, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { avatarVariants, type AvatarSize } from './avatar.variants'

/**
 * Someone, as a round photo. With no photo, or one that fails to load, a person drawn simply on
 * the surface tone takes its place, fading in: never initials. Its name is what screen readers
 * hear, and what an AvatarGroup shows on hover.
 */
const props = defineProps<{
  src?: string
  /** Who it is. */
  name?: string
  /** Describes the photo, if it says more than the name. */
  alt?: string
  size?: AvatarSize
  class?: HTMLAttributes['class']
}>()
const labels = useLabels()

const failed = ref(false)
watch(
  () => props.src,
  () => (failed.value = false),
)
const showsPhoto = computed(() => !!props.src && !failed.value)
</script>

<template>
  <span role="img" :aria-label="alt ?? name ?? labels.person" :class="cn(avatarVariants({ size }), props.class)">
    <img v-if="showsPhoto" :src="src" alt="" class="size-full object-cover" @error="failed = true" />
    <!-- A head and shoulders, cut by the circle as a portrait is. -->
    <svg
      v-else
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      class="size-full translate-y-[8%] transition-opacity duration-300 starting:opacity-0"
    >
      <circle cx="12" cy="9.5" r="4" />
      <path d="M4 22.5c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5v1.5H4z" />
    </svg>
  </span>
</template>
