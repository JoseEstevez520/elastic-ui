<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { ChevronLeftIcon } from '../../icons/internal'
import { contentOut, morphCloseTransition, morphTransition, prefersReducedMotion } from '../../utils/motion'
import ImageAurora from '../image-aurora/ImageAurora.vue'

/**
 * Lab: project cards, each glowing in its photo's colours, that become their page. Pressed, the
 * card's box grows to fill the screen, as Sheet's does (a real size, never scaled); its photo
 * travels to become the page's header; its aurora stretches with the box into the page's ground;
 * its own words fade as the page's come into focus as a wave. Back (the button or Escape), the
 * page's content fades, then it all folds back into the card, photo and glow with it.
 */
export interface Project {
  src: string
  title: string
  kind: string
  summary: string
  body: string[]
}
defineProps<{ projects: Project[] }>()

type Box = { top: number; left: number; width: number; height: number }
const rect = (el: Element | null | undefined): Box | undefined => {
  const r = el?.getBoundingClientRect()
  return r && { top: r.top, left: r.left, width: r.width, height: r.height }
}

// Which card is out, and where each moving piece is: the box and the travelling photo.
const active = ref<number>()
const phase = ref<'closed' | 'placed' | 'open' | 'settled' | 'closing'>('closed')
const cardBox = ref<Box>()
const photoBox = ref<Box>()
const heroBox = ref<Box>()
const pageShows = ref(false)

const cards = ref<HTMLElement[]>([])
const photos = ref<HTMLElement[]>([])
const hero = useTemplateRef<HTMLElement>('hero')

const screen = () => ({ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight })
const grown = computed(() => phase.value === 'open' || phase.value === 'settled')

let timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, run: () => void) => timers.push(setTimeout(run, prefersReducedMotion() ? 0 : ms))
onBeforeUnmount(() => timers.forEach(clearTimeout))

async function openCard(i: number) {
  if (phase.value !== 'closed') return
  active.value = i
  cardBox.value = rect(cards.value[i])
  photoBox.value = rect(photos.value[i])
  phase.value = 'placed'
  document.documentElement.style.overflow = 'hidden'
  await nextTick()
  // Where the header will be once the page fills the screen: the box is still exactly on the
  // card, so the hero's place within it now is the hero's place from the screen's corner once
  // the box has grown there. Read with the same getBoundingClientRect as every other rect here,
  // never offsetTop/offsetWidth (rounded to whole pixels), so the traveller lands exactly on it.
  const h = rect(hero.value)
  heroBox.value = h &&
    cardBox.value && {
      top: h.top - cardBox.value.top,
      left: h.left - cardBox.value.left,
      width: h.width,
      height: h.height,
    }
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      phase.value = 'open'
      pageShows.value = true
      later(morphTransition.duration * 1000, () => (phase.value = 'settled'))
    }),
  )
}

function closeCard() {
  if (phase.value !== 'settled' && phase.value !== 'open') return
  const i = active.value!
  // The header may have scrolled: the photo leaves from where it is now.
  heroBox.value = rect(hero.value)
  pageShows.value = false
  phase.value = 'open'
  later(contentOut.duration * 1000, () => {
    cardBox.value = rect(cards.value[i])
    photoBox.value = rect(photos.value[i])
    phase.value = 'closing'
    later(morphCloseTransition.duration * 1000, () => {
      phase.value = 'closed'
      active.value = undefined
      document.documentElement.style.overflow = ''
    })
  })
}
useEventListener<KeyboardEvent>(
  () => document,
  'keydown',
  (e) => e.key === 'Escape' && closeCard(),
)

const ease = (t: { duration: number; ease: readonly number[] }) => `${t.duration}s cubic-bezier(${t.ease.join(',')})`
const moving = (box: Box | undefined, transition: string, radius: string) => ({
  top: `${box?.top ?? 0}px`,
  left: `${box?.left ?? 0}px`,
  width: `${box?.width ?? 0}px`,
  height: `${box?.height ?? 0}px`,
  borderRadius: radius,
  transition:
    phase.value === 'placed' || prefersReducedMotion()
      ? 'none'
      : ['top', 'left', 'width', 'height', 'border-radius'].map((p) => `${p} ${transition}`).join(','),
})
const surfaceStyle = computed(() =>
  moving(
    grown.value ? screen() : cardBox.value,
    ease(phase.value === 'closing' ? morphCloseTransition : morphTransition),
    grown.value ? '0px' : 'var(--radius-2xl)',
  ),
)
// The photo travels while the box grows; once landed, the header in the page takes over. Its
// radius stays put the whole way: the card's own photo is `rounded-2xl` and the hero is
// `rounded-[24px]`, the same `--radius-2xl` token, so nothing to animate there.
const travelling = computed(() => phase.value === 'placed' || phase.value === 'open' || phase.value === 'closing')
const photoStyle = computed(() =>
  moving(
    phase.value === 'placed' || phase.value === 'closing' ? photoBox.value : heroBox.value,
    ease(phase.value === 'closing' ? morphCloseTransition : morphTransition),
    'var(--radius-2xl)',
  ),
)
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <button
      v-for="(p, i) in projects"
      :key="p.src"
      ref="cards"
      type="button"
      :class="[
        'group cursor-pointer text-left focus-ring rounded-[24px]',
        active === i && phase !== 'closed' && 'invisible',
      ]"
      @click="openCard(i)"
    >
      <ImageAurora :src="p.src" look="artwork" class="rounded-[24px] border border-[color:var(--color-border)]">
        <div class="p-3">
          <img
            ref="photos"
            :src="p.src"
            alt=""
            crossorigin="anonymous"
            class="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
        <div class="px-5 pt-2 pb-5">
          <p class="text-xs font-medium text-fg-muted">{{ p.kind }}</p>
          <h3 class="mt-1 text-lg font-semibold text-fg">{{ p.title }}</h3>
          <p class="mt-2 text-sm text-fg-secondary">{{ p.summary }}</p>
        </div>
      </ImageAurora>
    </button>
  </div>

  <Teleport to="body">
    <template v-if="active !== undefined && phase !== 'closed'">
      <!-- The box: the card's own glow, stretching into the page's ground. -->
      <div
        role="dialog"
        :aria-label="projects[active]!.title"
        class="fixed z-50 overflow-hidden bg-[color:var(--color-bg)]"
        :style="surfaceStyle"
      >
        <ImageAurora :src="projects[active]!.src" look="artwork" class="absolute inset-0" />
        <!-- The card's words, where they were, fading as the box leaves (and back as it lands). -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute top-0 left-0 px-5 pb-5 transition-opacity"
          :style="{ width: `${cardBox?.width}px`, paddingTop: `${(photoBox?.height ?? 0) + 20}px` }"
          :class="
            phase === 'placed' || phase === 'closing' ? 'opacity-100 duration-300 delay-150' : 'opacity-0 duration-150'
          "
        >
          <p class="text-xs font-medium text-fg-muted">{{ projects[active]!.kind }}</p>
          <p class="mt-1 text-lg font-semibold text-fg">{{ projects[active]!.title }}</p>
          <p class="mt-2 text-sm text-fg-secondary">{{ projects[active]!.summary }}</p>
        </div>
        <!-- The page, laid out at the screen's size from the start, pinned to the box's corner. -->
        <div
          class="absolute top-0 left-0 overscroll-contain scrollbar-subtle"
          :class="phase === 'settled' ? 'overflow-y-auto' : 'overflow-hidden'"
          :style="{ width: '100vw', height: '100dvh' }"
        >
          <div class="mx-auto max-w-3xl px-6 pt-6 pb-16">
            <button
              type="button"
              :class="[
                'mb-6 inline-flex h-9 cursor-pointer items-center gap-1 rounded-full pr-3 pl-2 text-sm text-fg-secondary transition-[opacity,color] hover:text-fg focus-ring',
                pageShows ? 'opacity-100 delay-300 duration-300' : 'opacity-0 duration-150',
              ]"
              @click="closeCard"
            >
              <ChevronLeftIcon aria-hidden="true" class="size-4" /> Projects
            </button>
            <img
              ref="hero"
              :src="projects[active]!.src"
              alt=""
              crossorigin="anonymous"
              class="aspect-[16/9] w-full rounded-[24px] object-cover"
              :class="phase === 'settled' ? 'visible' : 'invisible'"
            />
            <div
              :class="
                pageShows ? 'stagger-children [--stagger-delay:0.26s]' : 'opacity-0 transition-opacity duration-150'
              "
              class="mt-8"
            >
              <p class="text-sm font-medium text-fg-muted">{{ projects[active]!.kind }}</p>
              <h1 class="mt-1 text-4xl font-semibold tracking-tight text-fg">{{ projects[active]!.title }}</h1>
              <p class="mt-4 text-lg text-fg-secondary">{{ projects[active]!.summary }}</p>
              <p v-for="(para, n) in projects[active]!.body" :key="n" class="mt-5 leading-relaxed text-fg-secondary">
                {{ para }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- The photo, travelling from the card to the header and back, above the box. -->
      <img
        v-if="travelling"
        :src="projects[active]!.src"
        alt=""
        aria-hidden="true"
        crossorigin="anonymous"
        class="pointer-events-none fixed z-50 object-cover"
        :style="photoStyle"
      />
    </template>
  </Teleport>
</template>
