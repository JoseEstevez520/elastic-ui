<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { ChatThreadReadyKey } from './chat.keys'

/**
 * The messages, scrolling on their own. It stays at the end as the conversation grows, but
 * never pulls the reader down while they have scrolled up to reread; a new message always
 * brings the end back into view.
 */
const props = defineProps<{ label?: string; class?: HTMLAttributes['class'] }>()

const el = useTemplateRef<HTMLElement>('el')
// Close enough to the end to count as following it.
const NEAR = 80
let following = true
let count = 0

// Answers there when the thread first shows just show; only new ones come in.
const ready = ref(false)
provide(ChatThreadReadyKey, ready)

const toEnd = () => {
  if (el.value) el.value.scrollTop = el.value.scrollHeight
}
const onScroll = () => {
  if (el.value) following = el.value.scrollHeight - el.value.scrollTop - el.value.clientHeight < NEAR
}

// Created on mount: observers do not exist during server rendering. A message added always
// scrolls to it; one growing (as an answer streams in) only while the reader follows.
let resized: ResizeObserver | undefined
let added: MutationObserver | undefined
onMounted(() => {
  const list = el.value?.firstElementChild
  if (!list) return
  count = list.childElementCount
  resized = new ResizeObserver(() => following && toEnd())
  resized.observe(list)
  added = new MutationObserver(() => {
    if (list.childElementCount > count) {
      following = true
      toEnd()
    }
    count = list.childElementCount
  })
  added.observe(list, { childList: true })
  toEnd()
  requestAnimationFrame(() => (ready.value = true))
})
onBeforeUnmount(() => {
  resized?.disconnect()
  added?.disconnect()
})
</script>

<template>
  <div
    ref="el"
    role="log"
    :aria-label="label ?? 'Conversation'"
    :class="cn('min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-subtle', props.class)"
    @scroll.passive="onScroll"
  >
    <div class="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <slot />
    </div>
  </div>
</template>
