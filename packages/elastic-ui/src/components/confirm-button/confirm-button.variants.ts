/**
 * The pill: flat, in the muted tone at rest. While its action runs, and once it is done or has
 * failed, it takes a tint of its tone's colour (danger, warning), as the thing it did.
 */
export const confirmPillClass = [
  'relative inline-flex h-10 items-center overflow-hidden rounded-[14px] align-middle',
  'transition-[width,background-color,border-radius] duration-[350ms] ease-emphasized motion-reduce:transition-none',
  // The keyboard's ring goes round the whole pill: inside it, the pill's own clip would cut it.
  'has-[>button:focus-visible]:outline-2 has-[>button:focus-visible]:outline-offset-2 has-[>button:focus-visible]:outline-[color:var(--color-accent)]',
]
export const confirmPillTone = {
  rest: 'bg-[color:var(--confirm-bg,var(--color-surface))]',
  /** A ghost one at rest: no surface until it asks, only the ghost Button's hover and radius. */
  ghost: 'rounded-[var(--radius-md)] bg-transparent hover:bg-bg-muted',
  danger: 'bg-[color:color-mix(in_oklab,var(--color-danger)_16%,var(--confirm-bg,var(--color-surface)))]',
  warning: 'bg-[color:color-mix(in_oklab,var(--color-warning)_18%,var(--confirm-bg,var(--color-surface)))]',
}
/** The confirm, and the square while it acts, in the tone's colour; a neutral one in the text's. */
export const confirmToneText = {
  danger: 'text-[color:var(--color-danger)]',
  warning: 'text-[color:var(--color-warning)]',
  neutral: 'text-fg',
}

/**
 * The answers' half: the pill split along a curve, a tone deeper, running to the pill's own edge,
 * with a tail pointing back at the icon. Depth from tones, never shadows (DECISIONS, "How objects
 * are drawn").
 */
export const confirmHalfClass = [
  'relative flex h-full flex-1 items-center justify-center gap-1.5 rounded-l-[14px] px-2',
  'bg-surface-sunk',
  'origin-left transition-[opacity,transform] ease-emphasized motion-reduce:transition-none',
]
export const confirmTailClass =
  'absolute top-1/2 -left-[5px] size-2.5 -translate-y-1/2 rotate-45 rounded-[2px] [background:inherit]'

/** Each answer: a circle a tone lighter than its half. */
export const confirmAnswerClass = [
  'relative flex size-6 cursor-pointer items-center justify-center rounded-full outline-none',
  'focus-visible:shadow-[0_0_0_2px_var(--color-accent)]',
  'bg-surface-raised',
]

/** The icon, the turning arc and the outcome share the square's place, one at a time. */
export const confirmGlyphClass = '[grid-area:1/1] transition-[opacity,scale,filter] duration-[250ms]'
export const confirmGlyphHidden = 'scale-50 opacity-0 blur-[2px]'
