/** The track: a quiet grey off, the accent on. As tall as a label's line, so it sits on the first. */
export const switchTrackClass = [
  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full',
  'bg-[color:var(--switch-track,var(--color-bg-inset))] data-[state=checked]:bg-[color:var(--switch-track-on,var(--color-accent))]',
  'transition-colors duration-200 ease-out',
  'focus-ring',
  'disabled:cursor-not-allowed',
]

/** The knob slides from one end to the other on the library's emphasized ease. */
export const switchThumbClass = [
  'pointer-events-none block size-4 translate-x-0.5 rounded-full bg-[color:var(--color-knob)] shadow-soft',
  'transition-transform duration-300 ease-emphasized data-[state=checked]:translate-x-[18px]',
  'motion-reduce:transition-none',
]
