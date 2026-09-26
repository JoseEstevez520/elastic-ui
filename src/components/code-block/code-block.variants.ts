/** A soft fill, no border: the code is set apart by its tone and its type. */
export const codeBlockClass = [
  'group/code relative rounded-[var(--code-radius,var(--radius-lg))] bg-[color:var(--code-bg,var(--color-bg-subtle))] text-ui',
]

export const codeBlockPreClass = [
  'overflow-x-auto scrollbar-subtle px-4 py-3.5 font-mono text-ui leading-relaxed text-fg',
  'focus-ring-inset',
]

// On a caption bar when there is a name to show; otherwise floating in the corner, shown on hover
// and on focus, so a bare snippet carries nothing at rest.
export const codeBlockCopyFloatingClass = [
  'absolute top-1.5 right-1.5 size-8 opacity-0 transition-opacity duration-150',
  'group-hover/code:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100',
]
