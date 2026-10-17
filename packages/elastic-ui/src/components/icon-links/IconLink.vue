<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { isExternal } from '../../utils/link'
import { logoColor, type LogoIcon } from '../logo/logo.utils'
import TextMorph from '../text-morph/TextMorph.vue'
import IconSwap from '../icon-swap/IconSwap.vue'
import { CheckIcon } from '../../icons/internal'
import { ICON_LINK_SIZE, useIconLinksContext } from './icon-links.context'

/**
 * One link of an IconLinks row: its icon, opening into its label. Or, given `copy`, a button that
 * copies an address (an email) and says so in its own place, its icon turning into a check and its
 * label into "Copied" (TextMorph).
 *
 * Its tray changes its real width, never its scale (DECISIONS, Motion rules): the label is laid
 * out from the start and uncovered as the tray grows, coming into focus once it has nearly arrived,
 * and fading at once before it folds back.
 */
const props = withDefaults(
  defineProps<{
    /** A brand's mark as Simple Icons gives it (`siGithub`), or any icon component (Lucide's `Globe`). */
    icon: LogoIcon | Component
    /** What shows as it opens: "Site", "Code", a username, an address. Short, on one line. */
    label: string
    href?: string
    /** Copies this instead of going anywhere. */
    copy?: string
    /** What it is, for screen readers, before the label ("GitHub: ada"): the mark's title by default. */
    name?: string
    /** Any CSS colour or gradient, for the icon and the tint behind the label. The mark's own colour by default. */
    brand?: string
    copiedLabel?: string
    newTabLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { copiedLabel: labelFor('copied'), newTabLabel: labelFor('newTab') },
)
const emit = defineEmits<{ copied: [] }>()

const { expanded, variant, reportWidth } = useIconLinksContext()
const id = useId()

const isMark = (icon: LogoIcon | Component): icon is LogoIcon => typeof icon === 'object' && 'path' in icon
const mark = computed(() => (isMark(props.icon) ? props.icon : undefined))
// Said before the label only when it adds something: "GitHub: ada", but never "Site: Site".
const name = computed(() => {
  const name = props.name ?? mark.value?.title
  return name && name !== props.label ? name : undefined
})
const brand = computed(() => props.brand ?? logoColor(mark.value?.hex) ?? 'var(--color-fg-secondary)')
// The mark is painted with the brand through its own shape, so a gradient fills it as a colour does.
const maskOf = (icon: LogoIcon) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${icon.path}"/></svg>`)}")`

const external = computed(() => !!props.href && isExternal(props.href))

const pointed = ref(false)
const focused = ref(false)
const copied = ref(false)
const open = computed(() => expanded.value || pointed.value || focused.value || copied.value)

// The tray's width at rest is its height; open, the width of an unseen copy of what it holds.
const SIZE = ICON_LINK_SIZE
const measure = useTemplateRef<HTMLElement>('measure')
const openWidth = ref<number>()
async function fit() {
  await nextTick()
  const width = measure.value?.getBoundingClientRect().width
  if (!width) return
  openWidth.value = width
  // The row decides from the label's width; "Copied" only stands in for a moment.
  if (!copied.value) reportWidth?.(id, width)
}
onMounted(fit)
watch([copied, () => props.label], fit)

// Long enough to read the check, short enough to copy again soon after.
const SHOWN = 2000
let timer: ReturnType<typeof setTimeout> | undefined
async function copyValue() {
  if (!props.copy) return
  await navigator.clipboard.writeText(props.copy)
  copied.value = true
  emit('copied')
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), SHOWN)
}
onBeforeUnmount(() => {
  clearTimeout(timer)
  reportWidth?.(id, undefined)
})
</script>

<template>
  <li class="relative flex">
    <component
      :is="copy ? 'button' : 'a'"
      v-bind="copy ? { type: 'button' } : { href, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }"
      :style="{ width: `${open && openWidth ? openWidth : SIZE}px`, '--icon-link-brand': brand }"
      :class="
        cn(
          'relative isolate inline-flex h-10 cursor-pointer items-center overflow-hidden rounded-full text-label text-fg focus-ring',
          'transition-[width,scale] ease-emphasized active:scale-[0.97] motion-reduce:transition-none',
          open ? 'duration-[350ms]' : 'duration-[250ms]',
          variant === 'default' && 'bg-surface',
          props.class,
        )
      "
      @pointerenter="pointed = true"
      @pointerleave="pointed = false"
      @focus="focused = true"
      @blur="focused = false"
      @click="copy && copyValue()"
    >
      <!-- The brand's tint, colour or gradient alike, coming in as the tray widens. -->
      <span
        aria-hidden="true"
        :class="[
          'absolute inset-0 -z-10 [background:var(--icon-link-brand)] transition-opacity ease-soft motion-reduce:transition-none',
          open ? 'opacity-[0.16] duration-[350ms]' : 'opacity-0 duration-150',
        ]"
      />

      <span class="grid size-10 shrink-0 place-items-center">
        <IconSwap v-if="copied" :icon="CheckIcon" class="size-[18px]" />
        <span
          v-else-if="mark"
          aria-hidden="true"
          class="size-[18px] [background:var(--icon-link-brand)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
          :style="{ maskImage: maskOf(mark) }"
        />
        <component :is="icon" v-else aria-hidden="true" :stroke-width="1.5" class="size-[18px] text-[color:var(--icon-link-brand)]" />
      </span>

      <span
        :class="[
          // Trimmed to the letters' cap height and baseline, so the words centre on the icon by
          // what is seen rather than by their line box, which sits a little high.
          'whitespace-nowrap pe-4 [text-box:trim-both_cap_alphabetic] transition-[opacity,filter] motion-reduce:transition-none',
          open ? 'opacity-100 blur-0 delay-[175ms] duration-[450ms] ease-soft' : 'opacity-0 blur-[2px] duration-150 ease-linear',
        ]"
      >
        <span v-if="name" class="sr-only">{{ name }}: </span>
        <TextMorph :text="copied ? copiedLabel : label" />
        <span v-if="external" class="sr-only"> ({{ newTabLabel }})</span>
      </span>
      <span class="sr-only" aria-live="polite">{{ copied ? copiedLabel : '' }}</span>
    </component>

    <!-- Measures the open width; inert, so it is never focused or read. -->
    <span ref="measure" aria-hidden="true" inert class="invisible absolute flex h-10 items-center text-label whitespace-nowrap">
      <span class="size-10 shrink-0" />
      <span class="pe-4">{{ copied ? copiedLabel : label }}</span>
    </span>
  </li>
</template>
