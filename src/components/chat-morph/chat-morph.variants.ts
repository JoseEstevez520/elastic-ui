import { cva } from 'class-variance-authority'

/**
 * The surface is the round button at rest and the chat box when open, pinned to the corner the box grows
 * from and clipping it while it grows.
 */
export const chatMorphSurfaceVariants = /* @__PURE__ */ cva(
  [
    'absolute overflow-hidden',
    'border border-[color:var(--chat-morph-border,var(--color-border))] bg-[color:var(--chat-morph-bg,var(--color-bg))]',
    'transition-[width,height,border-radius,box-shadow] ease-emphasized motion-reduce:transition-none',
  ],
  {
    variants: {
      floating: { true: 'right-0 bottom-0', false: 'top-0 left-0' },
      open: {
        // Opening lets the eye follow the shape; closing only wants it gone.
        true: 'rounded-[var(--chat-morph-radius,1.75rem)] shadow-overlay duration-500',
        // Half the button's size: a circle, and still a radius that animates smoothly.
        false: 'rounded-[1.5rem] shadow-soft duration-300',
      },
    },
  },
)

/** Pinned to the same corner as the surface, at its full size, so growing never reflows it. */
export const chatMorphPanelVariants = /* @__PURE__ */ cva(
  [
    'absolute flex flex-col text-fg outline-none',
    'w-[min(var(--chat-morph-width,24rem),calc(100vw-2rem))] h-[min(var(--chat-morph-height,36rem),calc(100dvh-3rem))]',
  ],
  {
    variants: {
      floating: { true: 'right-0 bottom-0', false: 'top-0 left-0' },
      open: {
        // Comes into focus once the shape is on its way.
        true: 'animate-[blur-in_0.4s_var(--ease-soft)_0.25s_both] motion-reduce:animate-none',
        // Leaves at once, then turns invisible, keeping its box to be measured.
        false: 'invisible opacity-0 transition-[opacity,visibility] duration-150',
      },
    },
  },
)

export const chatMorphTriggerClass = [
  'relative z-10 flex size-12 cursor-pointer items-center justify-center rounded-full text-fg',
  'transition-[opacity,filter] ease-soft motion-reduce:transition-none',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
]

/**
 * The icon blurs out at once as the box opens, and comes back into focus only once the box has
 * nearly folded back around it.
 */
export const chatMorphTriggerState = {
  open: 'pointer-events-none opacity-0 blur-[2px] duration-100',
  closed: 'duration-300 delay-[180ms]',
}
