<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { SearchIcon, XIcon } from '../../icons/internal'
import { useEventListener } from '../../composables/useEventListener'
import { cn } from '../../utils/cn'
import { labelFor, useLabels } from '../../utils/labels'
import {
  searchMorphClearClass,
  searchMorphIconClass,
  searchMorphInputVariants,
  searchMorphVariants,
} from './search-morph.variants'

/**
 * A search that grows out of its icon: at rest a button with a magnifier, pressed (or reached
 * with its shortcut) it widens into the field around the icon and takes the focus. Left empty,
 * it folds back into the button; with a query it stays open, with a button to clear it.
 */
const props = withDefaults(
  defineProps<{
    /** `plain`: no box, just the icon and the text. `soft`: a faint fill, no border. */
    variant?: 'plain' | 'soft'
    /** Accessible name of the button and the field. */
    label?: string
    placeholder?: string
    /** Opens it from anywhere on the page: `/`, or `mod+k` for ⌘K / Ctrl+K. */
    shortcut?: '/' | 'mod+k'
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'plain', label: labelFor('search'), placeholder: labelFor('searchPlaceholder') },
)

const query = defineModel<string>({ default: '' })
const open = defineModel<boolean>('open', { default: false })
const input = useTemplateRef<HTMLInputElement>('input')

async function expand() {
  open.value = true
  await nextTick()
  input.value?.focus({ preventScroll: true })
}

// Folds back only when there is nothing to keep: a query stays on show. Only focus leaving the
// field counts: the button it opens from lets go of the focus as it steps aside.
function onFocusOut(event: FocusEvent) {
  if (event.target !== input.value) return
  const next = event.relatedTarget
  if (next instanceof Node && (event.currentTarget as HTMLElement).contains(next)) return
  if (!query.value) open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (query.value) query.value = ''
  else input.value?.blur()
}

function clear() {
  query.value = ''
  input.value?.focus()
}

// The shortcut is ignored while typing elsewhere, so `/` in another field stays a slash.
useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (!props.shortcut || open.value) return
  const typing = event.target instanceof HTMLElement && event.target.closest('input, textarea, [contenteditable]')
  const matches =
    props.shortcut === '/' ? event.key === '/' && !typing : event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)
  if (!matches) return
  event.preventDefault()
  expand()
})

// Opened from outside with `v-model:open`, it takes the focus as it would from its button.
watch(open, (isOpen) => isOpen && document.activeElement !== input.value && expand())

const hasQuery = computed(() => query.value.length > 0)
const labels = useLabels()
</script>

<template>
  <div role="search" :class="cn(searchMorphVariants({ variant, open }), props.class)" @focusout="onFocusOut">
    <SearchIcon aria-hidden="true" :class="searchMorphIconClass" />

    <input
      ref="input"
      v-model="query"
      type="search"
      :aria-label="label"
      :placeholder="placeholder"
      :tabindex="open ? undefined : -1"
      :inert="!open"
      :class="searchMorphInputVariants({ open })"
      @keydown="onKeydown"
    />

    <button
      v-if="open && hasQuery"
      type="button"
      :aria-label="labels.clear"
      :class="searchMorphClearClass"
      @click="clear"
    >
      <XIcon aria-hidden="true" class="size-3.5" />
    </button>

    <!-- At rest the whole box is this button; open, it steps aside for the field. -->
    <button
      v-if="!open"
      type="button"
      :aria-label="label"
      :aria-expanded="false"
      class="absolute inset-0 cursor-pointer rounded-[inherit] focus-ring"
      @click="expand"
    />
  </div>
</template>
