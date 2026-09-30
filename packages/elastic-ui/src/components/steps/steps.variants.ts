import { cva, type VariantProps } from 'class-variance-authority'

export const stepsItemClass = 'grid grid-cols-[1.75rem_1fr] gap-x-4'

/** The number takes the text's colour once reached, as the line leading to it fills. */
export const stepsNumberVariants = /* @__PURE__ */ cva(
  'flex size-7 shrink-0 items-center justify-center rounded-full text-meta font-medium tabular-nums transition-colors duration-300 motion-reduce:transition-none',
  {
    variants: {
      state: {
        reached: 'bg-fg text-bg',
        upcoming: 'bg-bg-muted text-fg-muted',
        static: 'bg-bg-muted text-fg',
      },
    },
  },
)

export type StepsNumberState = NonNullable<VariantProps<typeof stepsNumberVariants>['state']>

/** The stretch of line down to the next step. */
export const stepsLineClass = 'relative my-1.5 w-px flex-1 bg-border'

/**
 * Fills from the top with the library's ease when the step is passed. Scaled rather than resized:
 * it is a hairline with nothing inside to stretch.
 */
export const stepsLineFillClass =
  'absolute inset-0 origin-top bg-fg transition-transform duration-450 ease-emphasized motion-reduce:transition-none'

export const stepsTitleClass = 'flex min-h-7 items-center text-label text-fg'

/** A step not open reads as a quieter title, ready to be opened. */
export const stepsTriggerClass = [
  'min-h-7 py-0.5 text-ui transition-colors duration-150',
  'data-[state=closed]:text-fg-muted data-[state=closed]:hover:text-fg',
]

export const stepsContentClass = 'flex flex-col gap-4 pt-2 pb-0 text-ui leading-relaxed'

/**
 * No box, even on hover: it reads as the steps' titles do, quiet until pointed at, and its chevron
 * leans the way it goes.
 */
export const stepsNextClass = [
  'group/next inline-flex cursor-pointer items-center gap-1 self-start rounded-[var(--radius-sm)] text-label',
  'text-fg-muted transition-colors duration-150 hover:text-fg',
  'focus-ring',
]
