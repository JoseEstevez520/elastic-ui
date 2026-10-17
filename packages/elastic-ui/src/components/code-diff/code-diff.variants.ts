import { cva } from 'class-variance-authority'

/**
 * One line of the diff. A removed line takes a soft tint of the danger colour, an added one of the
 * success colour; a line in both is plain. The tints only say which side a line is on.
 */
export const codeDiffLineVariants = /* @__PURE__ */ cva(
  'grid grid-cols-[1.75rem_1fr] pr-4 whitespace-pre transition-[background-color,color] duration-300 ease-soft motion-reduce:transition-none',
  {
    variants: {
      type: {
        same: 'text-fg',
        removed: 'bg-[color:var(--code-diff-removed,color-mix(in_oklab,var(--color-danger)_10%,transparent))] text-fg-secondary',
        added: 'bg-[color:var(--code-diff-added,color-mix(in_oklab,var(--color-success)_10%,transparent))] text-fg',
        // A removed line before the change is shown: still plain.
        pending: 'text-fg',
      },
    },
  },
)

export const codeDiffSignVariants = /* @__PURE__ */ cva('text-center select-none', {
  variants: {
    type: {
      same: 'text-transparent',
      pending: 'text-transparent',
      removed: 'text-[color:var(--color-danger)]',
      added: 'text-[color:var(--color-success)]',
    },
  },
})
