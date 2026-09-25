<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { AlertIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { chatThreadLineClass } from './chat.variants'

/**
 * A few words a step holds instead of sources, such as what went wrong when it failed. Hangs from
 * the same fine thread as ChatSources, and comes into focus each time the step opens around it.
 * With `error` it reads as an answer's failure does: the alert beside it, in the danger colour.
 * Only here, once opened: the step's own line stays quiet, since the answer went on.
 */
const props = defineProps<{ error?: boolean; class?: HTMLAttributes['class'] }>()
</script>

<template>
  <p
    :class="
      cn(
        chatThreadLineClass,
        'flex items-start gap-2 text-sm leading-relaxed',
        error ? 'text-[color:var(--color-danger)]' : 'text-fg-muted',
        '[[data-state=open]>*>&]:animate-blur-in motion-reduce:animate-none',
        props.class,
      )
    "
  >
    <!-- Centred on the first line, however many the words take. -->
    <AlertIcon v-if="error" aria-hidden="true" class="mt-[0.3em] size-3.5 shrink-0" />
    <span><slot /></span>
  </p>
</template>
