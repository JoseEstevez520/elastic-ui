<script setup lang="ts">
import { siGithub } from 'simple-icons'
import { h, ref, useTemplateRef, type FunctionalComponent } from 'vue'
import {
  AnimatedList,
  Button,
  ConfirmButton,
  MorphHeader,
  MorphHeaderLink,
  MorphHeaderNav,
  PopoverMorph,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextMorph,
  ThemeToggle,
} from 'elastic-ui'
// Not part of the package's public API (src/index.ts): the site is the library's own consumer,
// built straight against its source, so it can reach for this the way the library's own parts do.
import { usePlayInTurn } from '../../src/composables/usePlayInTurn'

const REPO = 'https://github.com/JoseEstevez520/elastic-ui'

// The library ships no icons: Lucide stands in for a project's own, Simple Icons for brand logos
// (USAGE 4). Here as a plain mark in the text's own colour, not the brand's.
const GithubIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true' }, [h('path', { d: siGithub.path })])

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// The hero's demo: a button that becomes its panel, played once in view and then left to press.
const heroOpen = ref(false)
const heroPlaying = ref(false)
const heroRoot = useTemplateRef<HTMLElement>('heroRoot')
async function playHero() {
  heroPlaying.value = true
  heroOpen.value = true
  await wait(1500)
  heroOpen.value = false
  await wait(300)
  heroPlaying.value = false
}
usePlayInTurn(heroRoot, heroPlaying, playHero)

// A field that grows into its list, and folds back with what it picked.
const priority = ref<string>()
const selectOpen = ref(false)
const selectPlaying = ref(false)
const selectRoot = useTemplateRef<HTMLElement>('selectRoot')
async function playSelect() {
  selectPlaying.value = true
  selectOpen.value = true
  await wait(900)
  priority.value = 'high'
  await wait(500)
  selectOpen.value = false
  await wait(300)
  selectPlaying.value = false
}
usePlayInTurn(selectRoot, selectPlaying, playSelect)

// The same words becoming new ones, never switching off.
const statuses = ['Draft', 'In review', 'Published']
const statusIndex = ref(0)
const textMorphPlaying = ref(false)
const textMorphRoot = useTemplateRef<HTMLElement>('textMorphRoot')
async function playTextMorph() {
  textMorphPlaying.value = true
  for (let i = 1; i < statuses.length; i++) {
    await wait(900)
    statusIndex.value = i
  }
  await wait(900)
  textMorphPlaying.value = false
}
usePlayInTurn(textMorphRoot, textMorphPlaying, playTextMorph)

// A list making room for what arrives, never jumping over what's already there.
interface Activity {
  id: number
  text: string
}
const activityFeed: Activity[] = [
  { id: 1, text: 'Nadia commented on the brief' },
  { id: 2, text: 'Build passed on main' },
  { id: 3, text: 'Sara joined the project' },
]
const activity = ref<Activity[]>([])
const listPlaying = ref(false)
const listRoot = useTemplateRef<HTMLElement>('listRoot')
async function playList() {
  listPlaying.value = true
  for (const item of activityFeed) {
    await wait(500)
    activity.value = [...activity.value, item]
  }
  await wait(700)
  listPlaying.value = false
}
usePlayInTurn(listRoot, listPlaying, playList)

// An action that asks first, right where it was pressed.
const confirmPlaying = ref(false)
const confirmRoot = useTemplateRef<HTMLElement>('confirmRoot')
const deleteDemo = () => wait(700)
async function playConfirm() {
  confirmPlaying.value = true
  const group = confirmRoot.value
  group?.querySelector<HTMLButtonElement>('button[aria-label="Delete demo.txt"]')?.click()
  await wait(1300)
  group?.querySelector<HTMLButtonElement>('button[aria-label="Confirm"]')?.click()
  await wait(2400)
  confirmPlaying.value = false
}
usePlayInTurn(confirmRoot, confirmPlaying, playConfirm)
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <MorphHeader>
      <template #logo>
        <span class="text-label font-semibold tracking-tight text-fg">elastic-ui</span>
      </template>
      <MorphHeaderNav>
        <MorphHeaderLink href="#idea">The idea</MorphHeaderLink>
        <MorphHeaderLink href="#rules">The rules</MorphHeaderLink>
      </MorphHeaderNav>
      <template #actions>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          :icon="GithubIcon"
          :href="REPO"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Repository"
        />
      </template>
    </MorphHeader>

    <main>
      <!-- Hero: the name, the idea in one line, and a demo that makes the point at once. -->
      <section ref="heroRoot" class="article flex flex-col items-center gap-6 pt-32 pb-24 text-center sm:pt-40 sm:pb-32">
        <div class="stagger-children flex flex-col items-center gap-6">
          <h1 class="text-display text-fg">elastic-ui</h1>
          <p class="text-title font-normal text-fg-secondary">Things transform instead of appearing.</p>

          <!-- Narrower than the default 18rem: centred on a narrow phone, a wider panel would grow
               past the edge of the screen on the side away from the trigger. -->
          <PopoverMorph label="A short demonstration" v-model:open="heroOpen" class="w-56 sm:w-64">
            <template #trigger>See it grow</template>
            <template #default="{ close }">
              <p class="text-copy text-fg">This panel grew out of that button.</p>
              <p class="mt-1 text-copy text-fg-secondary">Nothing appeared. It became something.</p>
              <Button size="sm" variant="ghost" class="mt-4" @click="close">Fold it back</Button>
            </template>
          </PopoverMorph>

          <div class="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" to="/components">Explore the parts</Button>
            <Button size="lg" variant="outline" to="/docs">Get started</Button>
          </div>
        </div>
      </section>

      <!-- The idea, shown: one sentence and one live part, one after another. -->
      <section id="idea" class="article flex flex-col gap-16 py-20 sm:gap-20">
        <p class="text-label tracking-wide text-fg-muted uppercase">The idea, shown</p>

        <div ref="selectRoot" class="flex flex-col gap-4">
          <p class="text-copy text-fg-secondary">A field grows into its list, and folds back with what you picked.</p>
          <div class="rounded-[var(--radius-xl)] bg-bg-subtle p-8">
            <Select v-model="priority" v-model:open="selectOpen" class="w-56">
              <SelectTrigger><SelectValue placeholder="Set the priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div ref="textMorphRoot" class="flex flex-col gap-4">
          <p class="text-copy text-fg-secondary">The same words can become new ones, without ever just switching off.</p>
          <div class="rounded-[var(--radius-xl)] bg-bg-subtle p-8">
            <p class="text-title text-fg"><TextMorph :text="statuses[statusIndex]!" /></p>
          </div>
        </div>

        <div ref="listRoot" class="flex flex-col gap-4">
          <p class="text-copy text-fg-secondary">A list makes room for what arrives, never jumping over what's already there.</p>
          <div class="rounded-[var(--radius-xl)] bg-bg-subtle p-8">
            <AnimatedList :items="activity" :item-key="(item) => item.id" class="flex flex-col gap-2" item-class="text-copy text-fg">
              <template #default="{ item }">{{ item.text }}</template>
              <template #empty><p class="text-copy text-fg-muted">Watching for activity…</p></template>
            </AnimatedList>
          </div>
        </div>

        <div ref="confirmRoot" class="flex flex-col gap-4">
          <p class="text-copy text-fg-secondary">Some actions ask first, right where you pressed them.</p>
          <div class="rounded-[var(--radius-xl)] bg-bg-subtle p-8">
            <ConfirmButton label="Delete demo.txt" :action="deleteDemo" />
          </div>
        </div>
      </section>

      <!-- The rules, in brief: a line each, with a link to where they're written in full. -->
      <section id="rules" class="article flex flex-col gap-8 py-20">
        <h2 class="text-title text-fg">The rules, in brief</h2>
        <ul class="flex flex-col gap-5">
          <li>
            <p class="text-label text-fg">Soft surfaces</p>
            <p class="text-copy text-fg-secondary">Depth comes from tone, not shadow: fewer boxes, more room.</p>
          </li>
          <li>
            <p class="text-label text-fg">One thing leads</p>
            <p class="text-copy text-fg-secondary">
              When something transforms, everything around it changes quietly, so the eye always knows what to follow.
            </p>
          </li>
          <li>
            <p class="text-label text-fg">Appearing is not becoming</p>
            <p class="text-copy text-fg-secondary">
              New content comes into focus; a value that changes turns into its new self. Never both at once.
            </p>
          </li>
        </ul>
        <Button variant="link" class="self-start px-0" to="/docs/principles">Read the rules in full</Button>
      </section>
    </main>

    <footer class="border-t border-border">
      <div class="article flex flex-col items-center gap-3 py-10 text-center">
        <a
          :href="REPO"
          target="_blank"
          rel="noopener noreferrer"
          class="focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] text-ui text-fg-secondary hover:text-fg"
        >
          <GithubIcon class="size-4" />
          Repository
        </a>
        <p class="text-meta text-fg-muted">MIT licensed. Made for my own projects, shared as is.</p>
      </div>
    </footer>
  </div>
</template>
