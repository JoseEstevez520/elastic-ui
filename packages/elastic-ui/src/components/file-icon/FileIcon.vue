<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { extensionOf, fileIconSize, kindColor, kindOf } from './file-icon.variants'

/**
 * A file as the Files app shows it: a small page with its corner folded, tinted in its kind's
 * colour, with its extension on it (PDF red, documents blue, sheets green, slides orange…). An
 * image shows itself instead, from `src` or the `file` given, its thumbnail coming into focus once
 * loaded; a video or a sound keeps its page, with a play mark or a wave.
 */
const props = withDefaults(
  defineProps<{
    /** The file's name, whose extension says what it is. */
    name: string
    /** A picture of it: an image's own URL, or a video's poster. */
    src?: string
    /** The file itself, for an image just dropped or chosen: its thumbnail is made from it. */
    file?: File
    size?: keyof typeof fileIconSize
    /** Any CSS colour, in place of the kind's own. */
    color?: string
    class?: HTMLAttributes['class']
  }>(),
  { size: 'md' },
)

const extension = computed(() => extensionOf(props.name))
const kind = computed(() => kindOf(extension.value))
const label = computed(() => (extension.value.length > 4 ? extension.value.slice(0, 4) : extension.value).toUpperCase())

// A thumbnail from the file itself, for an image; given back once done with.
const made = ref<string>()
watch(
  () => props.file,
  (file) => {
    if (made.value) URL.revokeObjectURL(made.value)
    made.value = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
  },
  { immediate: true },
)
onBeforeUnmount(() => made.value && URL.revokeObjectURL(made.value))
const picture = computed(() => props.src ?? made.value)
const loaded = ref(false)
watch(picture, () => (loaded.value = false))
</script>

<template>
  <span
    aria-hidden="true"
    :class="cn('relative inline-block shrink-0', fileIconSize[size], props.class)"
    :style="{ '--kind': props.color ?? `var(--file-icon-color, ${kindColor[kind]})` }"
  >
    <img
      v-if="picture && kind === 'image'"
      :src="picture"
      alt=""
      :class="[
        'size-full rounded-[22%/18%] object-cover ring-1 ring-[color:var(--color-border)] ring-inset',
        'transition-[opacity,filter] duration-[450ms] ease-soft motion-reduce:transition-none',
        loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-[2px]',
      ]"
      @load="loaded = true"
    />
    <svg v-else viewBox="0 0 32 40" class="size-full overflow-visible">
      <!-- The page, and its corner folded down over it. -->
      <path
        d="M6 0.5h13.5L31.5 12.5V34a5.5 5.5 0 0 1-5.5 5.5H6A5.5 5.5 0 0 1 0.5 34V6A5.5 5.5 0 0 1 6 0.5Z"
        class="fill-[color:color-mix(in_oklab,var(--kind)_10%,var(--color-bg))] stroke-[color:color-mix(in_oklab,var(--kind)_28%,var(--color-bg))]"
        stroke-width="1"
      />
      <path
        d="M19.5 0.5V8a4.5 4.5 0 0 0 4.5 4.5h7.5"
        class="fill-[color:color-mix(in_oklab,var(--kind)_22%,var(--color-bg))] stroke-[color:color-mix(in_oklab,var(--kind)_28%,var(--color-bg))]"
        stroke-width="1"
        stroke-linejoin="round"
      />
      <!-- A video's play mark, a sound's wave. -->
      <path v-if="kind === 'video'" d="M13 17.5v7l6-3.5Z" class="fill-[color:var(--kind)]" />
      <path
        v-else-if="kind === 'audio'"
        d="M10 21v2M13 18.5v7M16 17v10M19 19v6M22 20.5v3"
        class="stroke-[color:var(--kind)]"
        stroke-width="1.6"
        stroke-linecap="round"
      />
      <text
        v-if="label && size !== 'sm' && size !== 'xs'"
        x="16"
        y="34.5"
        text-anchor="middle"
        class="fill-[color:var(--kind)] font-sans font-semibold"
        :font-size="label.length > 3 ? 7.6 : 9"
        letter-spacing="0.2"
      >
        {{ label }}
      </text>
    </svg>
  </span>
</template>
