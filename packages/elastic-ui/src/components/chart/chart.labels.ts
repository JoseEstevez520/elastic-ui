export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface LabelRequest {
  /** The mark's centre and its radius (half a bar's width for a bar's top). */
  x: number
  y: number
  r: number
  text: string
  width: number
  height: number
  /** Bars only take the place above their top: anywhere else would read as another bar's. */
  onlyAbove?: boolean
}

export interface PlacedLabel {
  x: number
  y: number
  text: string
  anchor: 'start' | 'middle' | 'end'
}

const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

/**
 * Writes each name by its mark where it collides with nothing: no other name, no other mark, and
 * inside `bounds`. Each tries the eight places round its mark, right first, as a reader looks
 * for it; one that fits nowhere is left out, and the tooltip and the table still say it.
 */
export function placeLabels(requests: LabelRequest[], marks: Box[], bounds: Box): PlacedLabel[] {
  const placed: Box[] = []
  const result: PlacedLabel[] = []
  const gap = 4
  for (const label of requests) {
    const { x, y, r, width: w, height: h } = label
    const d = r + gap
    const corner = d * 0.75
    const candidates: Array<[Box, PlacedLabel['anchor']]> = label.onlyAbove
      ? [[{ x: x - w / 2, y: y - gap - h, width: w, height: h }, 'middle']]
      : [
          [{ x: x + d, y: y - h / 2, width: w, height: h }, 'start'],
          [{ x: x - d - w, y: y - h / 2, width: w, height: h }, 'end'],
          [{ x: x - w / 2, y: y - d - h, width: w, height: h }, 'middle'],
          [{ x: x - w / 2, y: y + d, width: w, height: h }, 'middle'],
          [{ x: x + corner, y: y - corner - h, width: w, height: h }, 'start'],
          [{ x: x - corner - w, y: y - corner - h, width: w, height: h }, 'end'],
          [{ x: x + corner, y: y + corner, width: w, height: h }, 'start'],
          [{ x: x - corner - w, y: y + corner, width: w, height: h }, 'end'],
        ]
    for (const [box, anchor] of candidates) {
      const inside = box.x >= bounds.x && box.y >= bounds.y && box.x + box.width <= bounds.x + bounds.width && box.y + box.height <= bounds.y + bounds.height
      if (!inside || placed.some((p) => overlaps(p, box)) || marks.some((m) => overlaps(m, box))) continue
      placed.push(box)
      const textX = anchor === 'start' ? box.x : anchor === 'end' ? box.x + box.width : box.x + box.width / 2
      result.push({ x: textX, y: box.y + box.height / 2, text: label.text, anchor })
      break
    }
  }
  return result
}
