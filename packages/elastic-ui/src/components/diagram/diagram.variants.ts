import { cva } from 'class-variance-authority'

/**
 * A group's parts. A row runs across while it fits and down once it does not (`stacked`); until
 * it has been measured, the `sm` breakpoint stands in. A grid holds two columns where there is
 * room for two and one where there is not, from the room itself rather than a breakpoint.
 */
export const diagramGroupVariants = /* @__PURE__ */ cva('flex min-w-0 gap-3', {
  variants: {
    layout: {
      row: '',
      column: 'flex-col items-stretch',
      grid: 'grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,max(var(--diagram-grid-min,14rem),calc((100%_-_0.75rem)/2))),1fr))]',
    },
    stacked: { true: '', false: '', unknown: '' },
  },
  compoundVariants: [
    { layout: 'row', stacked: false, class: 'flex-row items-center' },
    { layout: 'row', stacked: true, class: 'flex-col items-stretch' },
    { layout: 'row', stacked: 'unknown', class: 'flex-col items-stretch sm:flex-row sm:items-center' },
  ],
  defaultVariants: { layout: 'row', stacked: 'unknown' },
})

/** An area's parts, closer together than a group's: a column, a wrapping row or a grid of short items. */
export const diagramAreaPartsVariants = /* @__PURE__ */ cva('', {
  variants: {
    layout: {
      column: 'flex flex-col items-stretch gap-2',
      row: 'flex flex-wrap gap-1.5',
      grid: 'grid gap-x-4 gap-y-2 [grid-template-columns:repeat(auto-fill,minmax(min(100%,9rem),1fr))]',
    },
  },
  defaultVariants: { layout: 'column' },
})

/**
 * A part that holds others (an area, a group) shares a row's width with its neighbours, and is
 * never squeezed below a width it reads at: a row that cannot give it that runs down instead.
 */
export const diagramPartAcross = /* @__PURE__ */ cva('', {
  variants: {
    direction: {
      across: 'flex-auto min-w-[var(--diagram-area-min,10rem)]',
      down: '',
      // Not measured yet: across from the breakpoint that stands in.
      unknown: 'sm:flex-auto sm:min-w-[var(--diagram-area-min,10rem)]',
    },
  },
})
