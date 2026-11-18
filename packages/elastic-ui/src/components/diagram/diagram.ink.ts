import { shallowRef } from 'vue'

/*
 * Diagrams in ink: the parts keep their layout from the page, and a layer over them draws, with
 * Rough.js, what a pen would: a rough outline round each chip and area, in its colour, and a
 * rough line with its head from one part to the next where an arrow stands between them. Only
 * the lines are drawn; the words stay the page's own, in the hand-written face.
 */

// A ref, so every Diagram follows a settings switch at once.
const inkPreference = shallowRef(false)

/**
 * Draws every Diagram's composed parts in ink, app-wide (a setting). A Diagram's `ink` prop
 * still wins. Rough.js is only loaded once a diagram is drawn in ink.
 */
export function setDiagramInk(on: boolean) {
  inkPreference.value = on
}

export function getDiagramInk() {
  return inkPreference.value
}

export const diagramInk = inkPreference

let loading: Promise<typeof import('roughjs').default> | undefined
export function loadRough() {
  loading ??= import('roughjs').then((module) => module.default)
  return loading
}

const PARTS = '.diagram-chip, .diagram-area'
// Room left between an arrow's ends and the parts it joins.
const GAP = 4
const HEAD = 9

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

/** A stroke to bring in as a pen would, in the order it is drawn. */
export type InkStroke = SVGGElement

/**
 * Draws the parts inside `frame` on `layer` (an `<svg>` laid over the frame) and returns the
 * strokes in order. Seeded by position in the drawing, so a redraw (a resize, a part that comes
 * in) gives every stroke the same wobble as before.
 */
export function drawInk(rough: Awaited<ReturnType<typeof loadRough>>, frame: HTMLElement, layer: SVGSVGElement): InkStroke[] {
  const pen = rough.svg(layer)
  const origin = frame.getBoundingClientRect()
  const box = (el: Element): Box => {
    const r = el.getBoundingClientRect()
    return {
      left: r.left - origin.left,
      top: r.top - origin.top,
      right: r.right - origin.left,
      bottom: r.bottom - origin.top,
    }
  }
  const strokes: InkStroke[] = []
  let seed = 1

  for (const el of frame.querySelectorAll<HTMLElement>(`${PARTS}, .diagram-arrow`)) {
    if (el.classList.contains('diagram-arrow')) {
      const stroke = arrow(el)
      if (stroke) strokes.push(stroke)
      continue
    }
    const b = box(el)
    if (b.right - b.left < 1) continue
    const g = pen.rectangle(b.left, b.top, b.right - b.left, b.bottom - b.top, {
      seed: seed++,
      stroke: 'currentColor',
      strokeWidth: 1.5,
      roughness: 1.2,
      bowing: 0.8,
    })
    g.style.color = colourOf(el)
    strokes.push(g)
  }

  // From the part before the arrow to the part after it, along the way they run, through the
  // arrow's own place (its icon, hidden in ink, keeps the room and marks the line).
  function arrow(el: HTMLElement): InkStroke | undefined {
    const icon = el.querySelector('svg')
    if (!icon) return
    const mark = box(icon)
    const before = el.previousElementSibling && drawn(el.previousElementSibling)
    const after = el.nextElementSibling && drawn(el.nextElementSibling)
    const across = before && after ? after.left >= before.right - 1 : mark.right - mark.left >= mark.bottom - mark.top
    const midX = (mark.left + mark.right) / 2
    const midY = (mark.top + mark.bottom) / 2
    let from: [number, number]
    let to: [number, number]
    if (across) {
      from = [before ? before.right + GAP : mark.left, midY]
      to = [after ? after.left - GAP : mark.right, midY]
    } else {
      from = [midX, before ? before.bottom + GAP : mark.top]
      to = [midX, after ? after.top - GAP : mark.bottom]
    }
    const options = {
      seed: seed++,
      stroke: 'currentColor',
      strokeWidth: 1.5,
      roughness: 1,
      bowing: 1.2,
    }
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.append(pen.line(...from, ...to, options))
    g.append(...head(to, from, options))
    if (el.dataset.both !== undefined) g.append(...head(from, to, options))
    g.style.color = 'var(--color-fg-secondary)'
    return g
  }

  // A head at `tip`, pointing away from `tail`: two short strokes.
  function head(tip: [number, number], tail: [number, number], options: object) {
    const angle = Math.atan2(tip[1] - tail[1], tip[0] - tail[0])
    return [-0.5, 0.5].map((turn) =>
      pen.line(tip[0], tip[1], tip[0] - HEAD * Math.cos(angle + turn), tip[1] - HEAD * Math.sin(angle + turn), {
        ...options,
        roughness: 0.6,
      }),
    )
  }

  // What an arrow joins: a part itself, or the parts a group beside it holds, as one box.
  function drawn(el: Element): Box | undefined {
    const parts = el.matches(PARTS) ? [el] : [...el.querySelectorAll(PARTS)]
    const boxes = (parts.length ? parts : [el]).map(box)
    return {
      left: Math.min(...boxes.map((b) => b.left)),
      top: Math.min(...boxes.map((b) => b.top)),
      right: Math.max(...boxes.map((b) => b.right)),
      bottom: Math.max(...boxes.map((b) => b.bottom)),
    }
  }

  layer.replaceChildren(...strokes)
  return strokes
}

// The part's own colour, as its text takes it, kept as CSS so a change of theme needs no redraw.
function colourOf(el: HTMLElement) {
  const colour = getComputedStyle(el).getPropertyValue('--diagram-color').trim() || 'var(--color-accent)'
  return `color-mix(in oklab, ${colour} 75%, var(--color-fg))`
}

/** How long a whole drawing takes to come in, its last stroke included. */
const PEN = 550
const STAGGER = 90
export const penDuration = (strokes: InkStroke[]) => Math.min(strokes.length, 13) * STAGGER + PEN

/**
 * Brings the strokes in one after another, each drawn along its length as by a pen. Their paths
 * hold their first frame until they start. `elapsed` picks up a drawing already under way, when
 * the parts change while it comes in (the hand-written face arriving): it goes on from there.
 */
export function penIn(strokes: InkStroke[], elapsed = 0) {
  strokes.forEach((stroke, i) => {
    const delay = Math.min(i, 12) * STAGGER - elapsed
    if (delay <= -PEN) return
    for (const path of stroke.querySelectorAll('path')) {
      const length = path.getTotalLength()
      path.style.strokeDasharray = `${length}`
      path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
        duration: PEN,
        delay,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        fill: 'backwards',
      })
    }
  })
}
