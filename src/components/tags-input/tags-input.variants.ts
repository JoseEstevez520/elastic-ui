/** The field, as an Input's hairline, holding the tags and the text that becomes the next one. */
export const tagsInputClass = [
  'flex min-h-10 w-full flex-wrap items-center gap-1.5 px-3 py-1 text-sm text-fg',
  'rounded-[var(--input-radius,var(--radius-md))] bg-[color:var(--input-bg,transparent)]',
  'border border-[color:var(--input-border,var(--color-border-strong))] transition-colors duration-150 ease-out',
  'hover:border-[color:var(--input-border-hover,var(--color-fg-faint))]',
  'focus-within:border-[color:var(--input-border-focus,var(--color-fg-muted))]',
  'has-[[aria-invalid=true]]:border-[color:var(--color-danger)]',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
]

/**
 * A tag: Badge's soft pill. Added, it becomes one where its text was typed: the text stays, and
 * the pill's surface and room open round it (`tag-in`). Picked with Backspace, it darkens before
 * going.
 */
export const tagsInputItemClass = [
  'inline-flex h-6 max-w-full items-center gap-1 rounded-full bg-bg-muted pr-1 pl-2.5 text-xs font-medium text-fg-secondary',
  'animate-[tag-in_0.35s_var(--ease-emphasized)] motion-reduce:animate-none',
  'transition-colors duration-150 data-[state=active]:bg-[color:color-mix(in_oklab,var(--color-fg)_14%,transparent)] data-[state=active]:text-fg',
]

export const tagsInputDeleteClass = [
  'flex size-4 cursor-pointer items-center justify-center rounded-full text-fg-faint transition-colors',
  'hover:text-fg focus-ring',
]
