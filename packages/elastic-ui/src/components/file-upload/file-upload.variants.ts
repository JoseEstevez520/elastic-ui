/**
 * Where files are dropped: a dashed hairline, quiet at rest; while files are held over it, the line
 * darkens and the ground takes a tint, and its words morph to say it will take them.
 */
export const dropZoneClass = [
  'flex w-full cursor-pointer flex-col items-center justify-center gap-2 px-4 py-7 text-ui text-fg-muted',
  'rounded-[var(--radius-lg)] border border-dashed border-[color:var(--input-border,var(--color-border-strong))]',
  'transition-[border-color,background-color,color] duration-200 ease-out',
  'hover:border-[color:var(--input-border-hover,var(--color-fg-faint))] hover:text-fg-secondary focus-ring',
  'data-[over=true]:border-[color:var(--color-fg-muted)] data-[over=true]:bg-bg-subtle data-[over=true]:text-fg',
  'aria-invalid:border-[color:var(--color-danger)] disabled:pointer-events-none disabled:opacity-50',
]

/** A file's row, which is its own progress: the fill runs behind it as it goes up (as ProgressButton's). */
export const fileRowClass =
  'relative flex h-14 items-center gap-3 overflow-hidden rounded-[var(--radius-md)] pr-1.5 pl-3 text-ui text-fg'
