import { cva } from 'class-variance-authority'

/**
 * A plain table for data, as quiet as Prose's: no box round it and no stripes, rows parted by
 * hairlines, the header a step quieter than the cells in sentence case, figures lined up on the
 * right in digits of one width.
 */
export const tableClass = 'w-full caption-bottom border-collapse text-left text-ui text-fg'

export const tableHeaderClass = '[&_tr]:border-b [&_tr]:border-[color:var(--table-border,var(--color-border))]'

export const tableBodyClass =
  '[&_tr]:border-b [&_tr]:border-[color:var(--table-border,var(--color-border))] [&_tr:last-child]:border-0'

/** A row that does something when pressed takes the surface tone under the pointer. */
export const tableRowVariants = /* @__PURE__ */ cva('', {
  variants: {
    interactive: {
      true: 'cursor-pointer transition-colors duration-150 hover:bg-[color:var(--table-row-hover,var(--color-surface))] focus-within:bg-[color:var(--table-row-hover,var(--color-surface))]',
      false: '',
    },
  },
  defaultVariants: { interactive: false },
})

export const tableHeadVariants = /* @__PURE__ */ cva(
  'h-10 px-3 align-middle text-meta font-medium text-fg-muted whitespace-nowrap',
  {
    variants: { numeric: { true: 'text-right tabular-nums', false: '' } },
    defaultVariants: { numeric: false },
  },
)

export const tableCellVariants = /* @__PURE__ */ cva('px-3 py-2.5 align-middle', {
  variants: { numeric: { true: 'text-right tabular-nums', false: '' } },
  defaultVariants: { numeric: false },
})

export const tableCaptionClass = 'mt-3 text-left text-meta text-fg-muted'
