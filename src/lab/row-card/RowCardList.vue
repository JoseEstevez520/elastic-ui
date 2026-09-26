<script setup lang="ts">
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from 'reka-ui'
import { ref } from 'vue'
import Checkbox from '../../components/checkbox/Checkbox.vue'
import Textarea from '../../components/input/Textarea.vue'
import { disclosureContentClass, disclosureInnerClass } from '../../components/collapsible/collapsible.variants'

/**
 * Lab: a row that opens into its own card, after Things 3. Pressed, the row grows where it is into
 * a card: it rises to the raised tone, takes a radius and room around it, and its notes open under
 * its title, coming into focus as one wave (the disclosure's opening). The other rows step back a
 * tone instead of being blurred or covered; pressed again, or another row, it folds back into a
 * row. Nothing opens over the list. Keyboard and ARIA come from Reka UI's Accordion.
 */
export interface Task {
  id: string
  title: string
  when?: string
  notes?: string
  done?: boolean
}
const props = defineProps<{ tasks: Task[] }>()
const open = ref<string>()
const done = ref<Record<string, boolean>>(Object.fromEntries(props.tasks.map((t) => [t.id, !!t.done])))
const notes = ref<Record<string, string>>(Object.fromEntries(props.tasks.map((t) => [t.id, t.notes ?? ''])))

// The row and the card are one box: its tone, radius and room change on the disclosure's curve.
const box =
  'rounded-[var(--radius-xl)] transition-[background-color,margin,padding,color] duration-[450ms] ease-emphasized motion-reduce:transition-none'
</script>

<template>
  <AccordionRoot v-model="open" type="single" collapsible class="flex flex-col">
    <AccordionItem
      v-for="task in tasks"
      :key="task.id"
      :value="task.id"
      :class="[
        box,
        open === task.id ? '-mx-2 my-3 bg-surface-raised px-4 py-2' : 'mx-0 my-0 px-2 py-0',
        open && open !== task.id ? 'text-fg-faint' : 'text-fg',
      ]"
    >
      <AccordionHeader class="flex items-center gap-3">
        <Checkbox v-model="done[task.id]" :aria-label="task.title" />
        <AccordionTrigger
          class="flex min-w-0 flex-1 cursor-pointer items-baseline gap-3 py-2.5 text-left focus-ring-inset"
        >
          <span
            :class="[
              'min-w-0 flex-1 truncate text-label transition-colors',
              done[task.id] && 'text-fg-muted line-through decoration-fg-faint',
            ]"
          >
            {{ task.title }}
          </span>
          <span v-if="task.when" class="text-meta tabular-nums text-fg-muted">{{ task.when }}</span>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent :class="disclosureContentClass">
        <div :class="[disclosureInnerClass, 'pb-2 pl-7']">
          <Textarea v-model="notes[task.id]" bare placeholder="Notes" rows="1" class="min-h-0 resize-none text-fg-secondary [field-sizing:content]" />
          <div class="mt-2 flex gap-4 text-meta text-fg-muted">
            <span>{{ task.when ?? 'Anytime' }}</span>
            <span>Unit 3</span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>
