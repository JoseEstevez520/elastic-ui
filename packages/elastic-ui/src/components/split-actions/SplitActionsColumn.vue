<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import IconMorph from '../icon-morph/IconMorph.vue'
import Tooltip from '../tooltip/Tooltip.vue'
import TooltipGroup from '../tooltip/TooltipGroup.vue'
import type { SplitAction } from './split-actions.types'
import { useSplitOpen } from './useSplitOpen'

/**
 * Internal: SplitActions' `column`. The round button grows up into a column that holds its actions, as ConfirmButton's square
 * widens into its question: one shape, split in two by tone, the actions' part a tone deeper with
 * a tail pointing down at the button. Its real height grows on the morph's curve, the actions
 * come into focus as one wave from the button up, the plus turns into its close (IconMorph), and
 * each action's name is a tooltip at its side. Closing, the icons go first, then the column folds
 * back into the button.
 */
const props = defineProps<{ label: string; actions: SplitAction[] }>()
const emit = defineEmits<{ select: [action: SplitAction] }>()

const root = useTemplateRef<HTMLElement>('root')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const { open, showing, buttons, toggle, close, onKey } = useSplitOpen(root, trigger)

const SIZE = 44
const ROW = 40
const GAP = 8
// The actions' part: a row each and a little room, above a gap over the button.
const half = computed(() => props.actions.length * ROW + 8)
const height = computed(() => (open.value && showing.value ? SIZE + GAP + half.value : SIZE))

function choose(action: SplitAction) {
  action.onSelect?.()
  emit('select', action)
  close()
}
</script>

<template>
  <div ref="root" role="group" :aria-label="label" class="relative inline-block size-11 align-middle">
    <!-- The shape: the button's own surface, growing up from it; the actions' part inside it. -->
    <div
      class="absolute bottom-0 left-0 w-11 overflow-hidden rounded-[22px] bg-surface motion-reduce:transition-none"
      :style="{
        height: `${height}px`,
        transition: `height ${showing ? '420ms' : '280ms'} var(--ease-emphasized)`,
      }"
    >
      <div class="absolute inset-x-1 top-1 rounded-[18px] bg-surface-sunk" :style="{ height: `${half - 4}px` }">
        <span
          aria-hidden="true"
          class="absolute -bottom-[5px] left-1/2 size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] [background:inherit]"
        />
        <TooltipGroup>
          <div class="flex flex-col-reverse items-center gap-0 py-1">
            <Tooltip v-for="(action, i) in actions" :key="action.label" :content="action.label" side="left">
              <button
                :ref="(el) => el && (buttons[i] = el as HTMLButtonElement)"
                type="button"
                :aria-label="action.label"
                :tabindex="showing ? 0 : -1"
                :class="[
                  'flex size-9 cursor-pointer items-center justify-center rounded-full text-fg-secondary outline-none hover:bg-surface-raised hover:text-fg focus-visible:bg-surface-raised focus-visible:text-fg',
                  showing
                    ? 'animate-[blur-in_0.3s_var(--ease-soft)_both] motion-reduce:animate-none'
                    : 'opacity-0 transition-opacity duration-150',
                ]"
                :style="{ animationDelay: `${180 + i * 50}ms` }"
                @click="choose(action)"
                @keydown="onKey($event, i)"
              >
                <component :is="action.icon" aria-hidden="true" class="size-4" />
              </button>
            </Tooltip>
          </div>
        </TooltipGroup>
      </div>
    </div>
    <button
      ref="trigger"
      type="button"
      :aria-label="label"
      :aria-expanded="showing ? 'true' : 'false'"
      class="absolute bottom-0 left-0 flex size-11 cursor-pointer items-center justify-center rounded-full text-fg focus-ring"
      @click="toggle($event)"
    >
      <IconMorph :icon="showing ? 'close' : 'plus'" class="size-4" />
    </button>
  </div>
</template>
