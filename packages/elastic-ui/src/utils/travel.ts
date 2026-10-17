import { contentOut, EASE_EMPHASIZED, EASE_SOFT, prefersReducedMotion } from './motion'

/** An element, and where it was before a change. */
export interface Place {
  el: HTMLElement
  was: DOMRect
}

/** Where each element is now: take it just before a change. */
export const placesOf = (els: Iterable<HTMLElement>): Place[] =>
  [...els].map((el) => ({ el, was: el.getBoundingClientRect() }))

const SLIDE = { duration: 450, easing: `cubic-bezier(${EASE_EMPHASIZED.join(',')})` }

/**
 * After a change, each element that stayed but moved goes from where it was to its new place, the
 * library's one way of moving things (DECISIONS, "Leaving comes before making room"): when they all
 * go the same way along one line, as a list closing a gap, they slide there. When any would cut
 * across another (in opposite directions, as in a reorder, or diagonally, as tags or cards moving
 * to another line), sliding would cross them over one another: all that move fade out together
 * where they were, then come into focus where they land, in reading order, 40ms apart and none
 * past the eighth. Returns the animations, to cancel if another change comes first.
 */
export function travel(places: Place[]): Animation[] {
  if (prefersReducedMotion()) return []
  const movers = places
    .filter((p) => p.el.isConnected)
    .map(({ el, was }) => {
      const now = el.getBoundingClientRect()
      return { el, dx: was.left - now.left, dy: was.top - now.top, top: now.top, left: now.left }
    })
    .filter((m) => Math.abs(m.dx) > 0.5 || Math.abs(m.dy) > 0.5)

  const diagonal = movers.some((m) => Math.abs(m.dx) > 0.5 && Math.abs(m.dy) > 0.5)
  const opposite = (axis: 'dx' | 'dy') => movers.some((m) => m[axis] > 0.5) && movers.some((m) => m[axis] < -0.5)
  if (!diagonal && !opposite('dx') && !opposite('dy'))
    return movers.map(({ el, dx, dy }) =>
      el.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0px 0px' }], { ...SLIDE, fill: 'backwards' }),
    )

  const OUT = contentOut.duration * 1000
  movers.sort((a, b) => a.top - b.top || a.left - b.left)
  return movers.flatMap(({ el, dx, dy }, i) => {
    const from = `${dx}px ${dy}px`
    return [
      el.animate(
        [
          { translate: from, opacity: 1 },
          { translate: from, opacity: 0 },
        ],
        { duration: OUT, easing: 'linear' },
      ),
      el.animate(
        [
          { opacity: 0, filter: 'blur(2px)' },
          { opacity: 1, filter: 'blur(0px)' },
        ],
        {
          duration: 450,
          delay: OUT + Math.min(i, 7) * 40,
          easing: `cubic-bezier(${EASE_SOFT.join(',')})`,
          fill: 'backwards',
        },
      ),
    ]
  })
}
