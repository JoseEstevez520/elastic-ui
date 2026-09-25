import { cva } from 'class-variance-authority'

/** The code beside the steps, held in view while they scroll past. */
export const codeWalkthroughPanelClass = [
  'sticky top-[var(--code-walkthrough-top,6rem)] hidden max-h-[calc(100dvh-var(--code-walkthrough-top,6rem)-2rem)] flex-col overflow-hidden lg:flex',
  'rounded-[var(--code-radius,var(--radius-lg))] bg-[color:var(--code-bg,var(--color-bg-subtle))] text-sm',
]

/**
 * One line: what the step is about stays in full, the rest steps back. Lines on their way out
 * fade where they stand; new ones hold their room unseen until the others have moved.
 */
export const codeWalkthroughLineVariants = /* @__PURE__ */ cva(
  'min-h-[1lh] px-4 whitespace-pre motion-reduce:transition-none',
  {
    variants: {
      state: {
        shown: 'transition-[opacity,filter] duration-[450ms] ease-soft',
        leaving: 'opacity-0 transition-opacity duration-150',
        entering: 'opacity-0 blur-[2px]',
      },
      dim: { true: '', false: '' },
    },
    compoundVariants: [{ state: 'shown', dim: true, class: 'opacity-35' }],
  },
)

/**
 * A step's text and title: the one being read in full colour, the others quieter beside the code.
 * On a narrow screen every step carries its own code and reads in full.
 */
export const codeWalkthroughStepVariants = /* @__PURE__ */ cva('transition-colors duration-300', {
  variants: {
    part: { title: 'mb-2 text-base font-semibold', body: 'text-sm leading-relaxed [&>*+*]:mt-3' },
    active: { true: '', false: '' },
  },
  compoundVariants: [
    { part: 'title', active: true, class: 'text-fg' },
    { part: 'title', active: false, class: 'text-fg lg:text-fg-muted' },
    { part: 'body', active: true, class: 'text-fg-secondary' },
    { part: 'body', active: false, class: 'text-fg-secondary lg:text-fg-muted' },
  ],
})
