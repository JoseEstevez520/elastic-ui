import { cva } from 'class-variance-authority'

export const chatMessageVariants = cva('text-base leading-relaxed whitespace-pre-wrap text-fg', {
  variants: {
    role: {
      // A soft, round bubble with no border, taking at most most of the row.
      user: 'ml-auto w-fit max-w-[80%] rounded-3xl bg-[color:var(--chat-bubble,var(--color-bg-muted))] px-4 py-2.5',
      assistant: 'max-w-full',
    },
  },
})

// The composer, as Curio's: a filled pill and a round button of the same fill beside it. At rest
// the button sits under the pill's end and the two read as one; once there is something to send
// the pill makes room and the button separates from it, like a drop.
export const composerFieldClass = [
  'min-h-11 max-h-48 w-full resize-none rounded-3xl px-4 py-[11px] text-base leading-normal text-fg outline-none',
  'bg-[color:var(--chat-composer-bg,var(--color-bg-muted))] placeholder:text-fg-faint field-sizing-content',
  'overflow-y-auto scrollbar-subtle',
  '[transition:margin-right_0.5s_var(--ease-glide)] motion-reduce:transition-none',
]
export const composerButtonClass = [
  'flex size-11 cursor-pointer items-center justify-center rounded-full',
  'bg-[color:var(--chat-composer-bg,var(--color-bg-muted))] transition-colors duration-150',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
]
