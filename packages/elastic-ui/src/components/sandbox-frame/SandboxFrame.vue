<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { useThemeTokens } from '../../composables/useThemeTokens'
import { cn } from '../../utils/cn'
import { FRAME_HEIGHT, FRAME_THEME, frameDocument, themeSheet } from './sandbox-frame.document'

/**
 * An interactive piece written elsewhere (by a model, by a student), its HTML run in a frame of
 * its own where it can do no harm: scripts run, but without `allow-same-origin` it cannot reach
 * the page, its cookies or its storage, and its content policy allows no network. It looks like
 * the page: the library's tokens, resolved for the current theme, are its own, with plain buttons,
 * fields and the diagram classes styled in them, and a change of theme reaches it without a
 * reload, so what was done in it stays. It is as tall as what it holds, told by the frame itself,
 * so it never scrolls inside on a phone; it comes into focus once loaded.
 */
const props = withDefaults(
  defineProps<{
    /** The piece's HTML: a whole document or a fragment. */
    html: string
    /** What it is, for those who cannot see it. */
    label: string
    /** Its height in pixels until it says its own. */
    height?: number
    class?: HTMLAttributes['class']
  }>(),
  { height: 160 },
)

const frame = useTemplateRef<HTMLIFrameElement>('frame')
const tokens = useThemeTokens()
const sheet = computed(() => tokens.value && themeSheet(tokens.value.declarations, tokens.value.dark))

// Built from the theme only when the HTML changes: the frame reloads on a new document, and a new
// theme goes in by message instead, keeping its state.
const srcdoc = ref<string>()
watch(
  [() => props.html, () => !!sheet.value],
  ([html, ready]) => {
    if (ready) srcdoc.value = frameDocument(html, sheet.value!)
  },
  { immediate: true },
)
const loaded = ref(false)

function sendTheme() {
  if (sheet.value) frame.value?.contentWindow?.postMessage({ type: FRAME_THEME, css: sheet.value }, '*')
}
watch(sheet, sendTheme)

const contentHeight = ref<number>()
// A piece whose height follows the frame's (`height: 100vh` with a margin) would grow forever: past
// a burst of growth it stops following, and scrolls inside as a plain frame would.
let growth: number[] = []
let following = true
// A new piece starts over.
watch(srcdoc, () => {
  loaded.value = false
  growth = []
  following = true
})
useEventListener<MessageEvent>(
  () => window,
  'message',
  (e) => {
    if (!frame.value || e.source !== frame.value.contentWindow || e.data?.type !== FRAME_HEIGHT) return
    const height = Number(e.data.height)
    if (!following || !Number.isFinite(height) || height <= 0) return
    if (contentHeight.value !== undefined && height > contentHeight.value) {
      const now = performance.now()
      growth = [...growth.filter((t) => now - t < 1000), now]
      if (growth.length > 8) following = false
    }
    contentHeight.value = height
  },
)

function onLoad() {
  loaded.value = true
  // A theme changed while it loaded was sent before it could listen.
  sendTheme()
}
</script>

<template>
  <iframe
    v-if="srcdoc"
    ref="frame"
    :title="label"
    :srcdoc="srcdoc"
    sandbox="allow-scripts"
    referrerpolicy="no-referrer"
    loading="lazy"
    :class="
      cn(
        'block w-full rounded-[var(--radius-xl)] border-0 bg-bg-subtle',
        // Eases to its new height so nothing below it jumps; at once while it is still hidden.
        loaded ? 'animate-blur-in transition-[height] duration-300 ease-[var(--ease-emphasized)] motion-reduce:transition-none' : 'opacity-0',
        props.class,
      )
    "
    :style="{ height: `${contentHeight ?? height}px` }"
    @load="onLoad"
  />
  <!-- Its room, kept until mounted: the tokens are read from the page. -->
  <div v-else :class="cn('w-full rounded-[var(--radius-xl)] bg-bg-subtle', props.class)" :style="{ height: `${height}px` }" />
</template>
