<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { isExternal } from '../../utils/link'
import { logoColor, type LogoIcon } from '../logo/logo.utils'
import TextMorph from '../text-morph/TextMorph.vue'
import IconSwap from '../icon-swap/IconSwap.vue'
import { CheckIcon } from '../../icons/internal'
import { SOCIAL_LINK_SIZE, useSocialLinksContext } from './social-links.context'

/**
 * One place in a SocialLinks row: a link to a profile, or, given `copy`, a button that copies an
 * address (an email) and says so in its own place, its mark turning into a check and its handle
 * into "Copied" (TextMorph).
 *
 * Its tray changes its real width, never its scale (DECISIONS, Motion rules): the handle is laid
 * out from the start and uncovered as the tray grows, coming into focus once it has nearly arrived,
 * and fading at once before it folds back.
 */
const props = withDefaults(
  defineProps<{
    /** A brand's mark as Simple Icons gives it (`siGithub`), or any icon component (Lucide's `Mail`). */
    icon: LogoIcon | Component
    /** What shows as it opens: the username, or the address. Short, on one line. */
    handle: string
    /** The profile it goes to. */
    href?: string
    /** Copies this instead of going anywhere. */
    copy?: string
    /** The place's name, for screen readers: the mark's title by default. */
    label?: string
    /** Any CSS colour or gradient, for the mark and the tint behind the handle. The mark's own colour by default. */
    brand?: string
    copiedLabel?: string
    newTabLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { copiedLabel: labelFor('copied'), newTabLabel: labelFor('newTab') },
)
const emit = defineEmits<{ copied: [] }>()

const { expanded, reportWidth } = useSocialLinksContext()
const id = useId()

const isMark = (icon: LogoIcon | Component): icon is LogoIcon => typeof icon === 'object' && 'path' in icon
const mark = computed(() => (isMark(props.icon) ? props.icon : undefined))
const name = computed(() => props.label ?? mark.value?.title ?? '')
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
const SIZE = SOCIAL_LINK_SIZE
const measure = useTemplateRef<HTMLElement>('measure')
const openWidth = ref<number>()
async function fit() {
  await nextTick()
  const width = measure.value?.getBoundingClientRect().width
  if (!width) return
  openWidth.value = width
  // The row decides from the handle's width; "Copied" only stands in for a moment.
  if (!copied.value) reportWidth?.(id, width)
}
onMounted(fit)
watch([copied, () => props.handle], fit)

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
      :style="{ width: `${open && openWidth ? openWidth : SIZE}px`, '--social-brand': brand }"
      :class="
        cn(
          'group/social relative isolate inline-flex h-10 cursor-pointer items-center overflow-hidden rounded-full bg-surface text-label text-fg focus-ring',
          'transition-[width,scale] ease-emphasized active:scale-[0.97] motion-reduce:transition-none',
          open ? 'duration-[350ms]' : 'duration-[250ms]',
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
          'absolute inset-0 -z-10 [background:var(--social-brand)] transition-opacity ease-soft motion-reduce:transition-none',
          open ? 'opacity-[0.16] duration-[350ms]' : 'opacity-0 duration-150',
        ]"
      />

      <span class="grid size-10 shrink-0 place-items-center">
        <IconSwap v-if="copied" :icon="CheckIcon" class="size-[18px]" />
        <span
          v-else-if="mark"
          aria-hidden="true"
          class="size-[18px] [background:var(--social-brand)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
          :style="{ maskImage: maskOf(mark) }"
        />
        <component :is="icon" v-else aria-hidden="true" :stroke-width="1.5" class="size-[18px] text-[color:var(--social-brand)]" />
      </span>

      <span
        :class="[
          'whitespace-nowrap pe-4 transition-[opacity,filter] motion-reduce:transition-none',
          open ? 'opacity-100 blur-0 delay-[175ms] duration-[450ms] ease-soft' : 'opacity-0 blur-[2px] duration-150 ease-linear',
        ]"
      >
        <span class="sr-only">{{ name }}: </span>
        <TextMorph :text="copied ? copiedLabel : handle" />
        <span v-if="external" class="sr-only"> ({{ newTabLabel }})</span>
      </span>
      <span class="sr-only" aria-live="polite">{{ copied ? copiedLabel : '' }}</span>
    </component>

    <!-- Measures the open width; inert, so it is never focused or read. -->
    <span ref="measure" aria-hidden="true" inert class="invisible absolute flex h-10 items-center text-label whitespace-nowrap">
      <span class="size-10 shrink-0" />
      <span class="pe-4">
{{ copied ? copiedLabel : handle }}
      </span>
    </span>
  </li>
</template>
