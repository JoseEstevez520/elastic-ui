<script setup lang="ts">
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui'
import { computed, nextTick, ref, useTemplateRef, watch, type Component, type HTMLAttributes } from 'vue'
import { MinusIcon } from '../../icons/internal'
import { labelFor, useLabels } from '../../utils/labels'
import FieldMorph from '../field-morph/FieldMorph.vue'

/**
 * An icon and a colour for something, in one field. At rest it is a line: the icon in its colour,
 * and its name. Opened, the field grows down into a row of colours and a grid of the icons the
 * project gives it (it ships none: pass the components, by name), and folds back once the field
 * is left. Colours go in and out as CSS colours, `null` for the neutral one; the icon as its name,
 * `null` for none. Either may be left out: give no `colors` and it only picks an icon.
 */
const props = withDefaults(
  defineProps<{
    /** The icons to choose from, by name. */
    icons: Record<string, Component>
    /** The colours to choose from; `null` is the neutral one, drawn in a grey. */
    colors?: { value: string | null; label: string }[]
    /** Names the field for screen readers. */
    label?: string
    /** What the line says when no icon is chosen, and the name of the cell that clears it. */
    noneLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { label: labelFor('icon'), noneLabel: labelFor('noIcon') },
)
const icon = defineModel<string | null>('icon', { default: null })
const color = defineModel<string | null>('color', { default: null })

const labels = useLabels()
const open = ref(false)
const morph = useTemplateRef<InstanceType<typeof FieldMorph>>('morph')
const button = useTemplateRef<HTMLButtonElement>('button')

const NONE = '__none__'
const names = computed(() => Object.keys(props.icons))
// A name drawn for people: "BookOpen" reads "Book open".
const humanise = (name: string) => name.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase()).replace(/ ([A-Z])/g, (m) => m.toLowerCase())
const current = computed(() => (icon.value ? props.icons[icon.value] : undefined))
// The neutral colour is the text's own; a colour given paints the icon.
const tint = computed(() => color.value ?? undefined)

// Opening puts the focus on the chosen icon, so the arrow keys work at once.
watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  const panel = morph.value?.panel
  const grid = panel?.querySelector<HTMLElement>('[data-icons]')
  const chosen = grid?.querySelector<HTMLElement>('[aria-checked=true]') ?? grid?.querySelector<HTMLElement>('[role=radio]')
  chosen?.focus({ preventScroll: true })
  // Brought into view inside the grid only, never by scrolling the page (DECISIONS, pitfalls).
  if (grid && chosen) {
    const inside = chosen.getBoundingClientRect().top - grid.getBoundingClientRect().top + grid.scrollTop
    grid.scrollTop = Math.max(0, inside - (grid.clientHeight - chosen.offsetHeight) / 2)
  }
})

const pickIcon = (value: unknown) => (icon.value = value === NONE ? null : (value as string))
const pickColor = (value: unknown) => (color.value = value === NONE ? null : (value as string))
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    event.stopPropagation()
    open.value = false
    button.value?.focus({ preventScroll: true })
  }
}
</script>

<template>
  <FieldMorph ref="morph" v-model:open="open" :class="props.class" @keydown="onKeydown">
    <button
      ref="button"
      type="button"
      :aria-label="label"
      :aria-expanded="open"
      class="group/pick flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-[inherit] px-3 text-left text-ui focus-ring"
      @click="open = !open"
    >
      <span class="grid size-5 shrink-0 place-items-center" :style="{ color: tint }" :class="!tint && 'text-fg'">
        <component :is="current" v-if="current" class="size-4" :stroke-width="1.75" aria-hidden="true" />
        <MinusIcon v-else class="size-4 text-fg-faint" aria-hidden="true" />
      </span>
      <span :class="['min-w-0 flex-1 truncate', icon ? 'text-fg' : 'text-fg-muted']">{{ icon ? humanise(icon) : noneLabel }}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-4 shrink-0 text-fg-faint transition-transform duration-[450ms] ease-emphasized group-aria-expanded/pick:rotate-180 motion-reduce:transition-none"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <template #panel>
      <div class="flex flex-col gap-3 px-3 pb-3 pt-1">
        <RadioGroupRoot
          v-if="colors?.length"
          :model-value="color ?? NONE"
          :aria-label="labels.color"
          class="flex flex-wrap gap-2"
          @update:model-value="pickColor"
        >
          <RadioGroupItem v-for="c in colors" :key="c.value ?? NONE" :value="c.value ?? NONE" as-child>
            <button
              type="button"
              :aria-label="c.label"
              class="group/dot grid size-6 place-items-center rounded-full focus-ring"
              :style="{ background: c.value ?? 'var(--color-fg-secondary)' }"
            >
              <!-- The one chosen has a dot in the ground's colour: a mark, not an outline. -->
              <span class="size-2 rounded-full bg-bg opacity-0 transition-opacity duration-150 group-aria-checked/dot:opacity-100 motion-reduce:transition-none" />
            </button>
          </RadioGroupItem>
        </RadioGroupRoot>

        <RadioGroupRoot
          data-icons
          :model-value="icon ?? NONE"
          :aria-label="label"
          class="grid max-h-48 grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-1 overflow-y-auto [scrollbar-gutter:stable]"
          @update:model-value="pickIcon"
        >
          <RadioGroupItem :value="NONE" as-child>
            <button
              type="button"
              :aria-label="noneLabel"
              class="grid size-9 place-items-center rounded-md text-fg-faint transition-colors duration-150 hover:bg-bg-inset aria-checked:bg-surface-raised aria-checked:text-fg focus-ring"
            >
              <MinusIcon class="size-4" aria-hidden="true" />
            </button>
          </RadioGroupItem>
          <RadioGroupItem v-for="name in names" :key="name" :value="name" as-child>
            <button
              type="button"
              :aria-label="humanise(name)"
              :title="humanise(name)"
              class="grid size-9 place-items-center rounded-md text-fg-secondary transition-colors duration-150 hover:bg-bg-inset aria-checked:bg-surface-raised aria-checked:text-fg focus-ring"
            >
              <component :is="icons[name]" class="size-4" :stroke-width="1.75" aria-hidden="true" />
            </button>
          </RadioGroupItem>
        </RadioGroupRoot>
      </div>
    </template>
  </FieldMorph>
</template>
