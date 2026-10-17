<script setup lang="ts">
import { computed, ref, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { avatarInitialVariants, avatarVariants, type AvatarSize } from './avatar.variants'

/**
 * Someone, as a round photo. With no photo, or one that fails to load, a person drawn simply on
 * the surface tone takes its place, fading in: never initials, unless `initials` asks for them.
 * Its name is what screen readers hear, and what an AvatarGroup shows on hover.
 */
const props = defineProps<{
  src?: string
  /** Who it is. */
  name?: string
  /** Describes the photo, if it says more than the name. */
  alt?: string
  size?: AvatarSize
  /** With no photo, the first letter of the name in neutral grey instead of the silhouette. Off by default. */
  initials?: boolean
  class?: HTMLAttributes['class']
}>()
const labels = useLabels()

const failed = ref(false)
watch(
  () => props.src,
  () => (failed.value = false),
)
const showsPhoto = computed(() => !!props.src && !failed.value)
// The first letter of the first word, upper-cased; none for a name without one (the silhouette stays).
const initial = computed(() => (props.initials && props.name?.trim() ? Array.from(props.name.trim())[0].toLocaleUpperCase() : ''))
</script>

<template>
  <span role="img" :aria-label="alt ?? name ?? labels.person" :class="cn(avatarVariants({ size }), props.class)">
    <img v-if="showsPhoto" :src="src" alt="" class="size-full object-cover" @error="failed = true" />
    <!-- A head and shoulders, cut by the circle as a portrait is. -->
    <span
      v-else-if="initial"
      aria-hidden="true"
      :class="cn(avatarInitialVariants({ size }), 'transition-opacity duration-300 starting:opacity-0')"
    >
      {{ initial }}
    </span>
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
