import { cva } from 'class-variance-authority'

/**
 * The sheet's content, at the sheet's size from the start and pinned to the edge the sheet grows
 * to, so the growing box uncovers it in place.
 */
export const sheetContentVariants = /* @__PURE__ */ cva('absolute flex flex-col', {
  variants: {
    side: {
      right: 'top-0 right-0',
      left: 'top-0 left-0',
      bottom: 'bottom-0 left-0 max-h-[85dvh]',
    },
  },
  defaultVariants: { side: 'right' },
})
