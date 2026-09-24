/**
 * Shared by Collapsible and Accordion. The outer element animates its height and clips; the
 * inner one fades. Tailwind only sees complete class names, so both states are spelled out.
 */
export const disclosureContentClass = [
  'overflow-hidden',
  'data-[state=open]:animate-disclosure-open data-[state=closed]:animate-disclosure-close',
  'motion-reduce:animate-none',
]

export const disclosureInnerClass = [
  // Comes into focus block by block (see `stagger-children` in tokens.css).
  'group-data-[state=open]/disclosure:stagger-children',
  'group-data-[state=closed]/disclosure:animate-content-out',
  'motion-reduce:animate-none',
]

export const disclosureTriggerClass = [
  'group/trigger flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left font-medium text-fg',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  'disabled:pointer-events-none disabled:opacity-50',
]
