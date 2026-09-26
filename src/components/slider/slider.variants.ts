/** A hairline of a track, as quiet as an Input's border, with room above and below for the thumb. */
export const sliderRootClass = [
  'relative flex h-7 w-full touch-none items-center select-none',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
]

export const sliderTrackClass = 'relative h-1 grow overflow-hidden rounded-full bg-bg-muted'

export const sliderRangeClass = 'absolute h-full rounded-full bg-[color:var(--slider-range,var(--color-accent))]'

/**
 * A small knob at rest; held, it grows into a pill that shows the value (its width set inline), as
 * the knob becoming the bubble rather than a bubble appearing over it.
 */
export const sliderThumbClass = [
  'flex h-4 cursor-grab items-center justify-center overflow-hidden rounded-full',
  'border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] shadow-soft',
  'text-xs font-medium text-fg tabular-nums',
  'transition-[width,height,border-color] duration-300 ease-emphasized motion-reduce:transition-none',
  'hover:border-[color:var(--color-fg-faint)] focus-ring',
  // Held, the pill itself shows where the focus is; the ring comes back once it folds.
  'data-[active=true]:h-7 data-[active=true]:cursor-grabbing data-[active=true]:outline-none',
  // The press lands on the thumb itself, which holds the pointer while dragging; its text is
  // rewritten as the value rolls, and would let go of it.
  '*:pointer-events-none',
]
