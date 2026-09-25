import { cva } from 'class-variance-authority'

/** A day: a round-cornered square, the accent once chosen, quieter outside the month. */
export const calendarDayVariants = /* @__PURE__ */ cva(
  [
    'relative flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-sm tabular-nums text-fg outline-none',
    'transition-colors duration-150 hover:bg-bg-muted focus-ring',
    'data-[outside-view]:text-fg-faint',
    'data-[disabled]:pointer-events-none data-[disabled]:text-fg-faint data-[disabled]:line-through',
    'data-[unavailable]:pointer-events-none data-[unavailable]:text-fg-faint data-[unavailable]:line-through',
    'data-[selected]:bg-[color:var(--color-accent)] data-[selected]:text-[color:var(--color-accent-fg)] data-[selected]:hover:bg-[color:var(--color-accent)]',
    // Today, quietly: a small dot under the number.
    "data-[today]:after:absolute data-[today]:after:bottom-1 data-[today]:after:size-1 data-[today]:after:rounded-full data-[today]:after:bg-current data-[today]:after:content-['']",
  ],
)

export const calendarNavClass = [
  'flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg focus-ring',
  'disabled:pointer-events-none disabled:opacity-40',
]
