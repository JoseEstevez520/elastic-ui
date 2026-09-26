/**
 * Icons drawn to morph: each is the same three strokes of four points on Lucide's 24 grid, so any
 * one can travel into any other point by point, the way TextMorph's letters travel. A stroke an
 * icon does not need is folded onto a point of one it keeps, and hidden, so it grows out of it.
 */
type Point = [number, number]
export interface Stroke {
  points: [Point, Point, Point, Point]
  hidden?: boolean
}
export type Glyph = [Stroke, Stroke, Stroke]

const line = (a: Point, b: Point): Stroke['points'] => [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b, b]
const at = (p: Point): Stroke => ({ points: [p, p, p, p], hidden: true })

export const glyphs = {
  menu: [{ points: line([4, 6], [20, 6]) }, { points: line([4, 12], [20, 12]) }, { points: line([4, 18], [20, 18]) }],
  close: [{ points: line([6, 6], [18, 18]) }, { points: line([18, 6], [6, 18]) }, at([12, 12])],
  plus: [{ points: line([12, 5], [12, 19]) }, { points: line([5, 12], [19, 12]) }, at([12, 12])],
  minus: [{ points: line([5, 12], [19, 12]) }, { points: line([5, 12], [19, 12]), hidden: true }, at([12, 12])],
  check: [
    {
      points: [
        [5, 12.5],
        [9.5, 17],
        [19, 7],
        [19, 7],
      ],
    },
    at([9.5, 17]),
    at([9.5, 17]),
  ],
  // Play's left edge slides over to be pause's left bar; its point straightens into the right one.
  play: [
    { points: line([8, 5], [8, 19]) },
    {
      points: [
        [8, 5],
        [19, 12],
        [19, 12],
        [8, 19],
      ],
    },
    at([12, 12]),
  ],
  pause: [
    { points: line([9, 5], [9, 19]) },
    {
      points: [
        [15, 5],
        [15, 12],
        [15, 12],
        [15, 19],
      ],
    },
    at([12, 12]),
  ],
  chevronDown: [
    {
      points: [
        [6, 9],
        [12, 15],
        [18, 9],
        [18, 9],
      ],
    },
    at([12, 15]),
    at([12, 15]),
  ],
  chevronUp: [
    {
      points: [
        [6, 15],
        [12, 9],
        [18, 15],
        [18, 15],
      ],
    },
    at([12, 9]),
    at([12, 9]),
  ],
  arrowRight: [
    { points: line([5, 12], [19, 12]) },
    {
      points: [
        [13, 6],
        [19, 12],
        [13, 18],
        [13, 18],
      ],
    },
    at([19, 12]),
  ],
  chevronRight: [
    {
      points: [
        [9, 6],
        [15, 12],
        [9, 18],
        [9, 18],
      ],
    },
    at([15, 12]),
    at([15, 12]),
  ],
  chevronLeft: [
    {
      points: [
        [15, 6],
        [9, 12],
        [15, 18],
        [15, 18],
      ],
    },
    at([9, 12]),
    at([9, 12]),
  ],
  arrowLeft: [
    { points: line([19, 12], [5, 12]) },
    {
      points: [
        [11, 6],
        [5, 12],
        [11, 18],
        [11, 18],
      ],
    },
    at([5, 12]),
  ],
  arrowUp: [
    { points: line([12, 19], [12, 5]) },
    {
      points: [
        [6, 11],
        [12, 5],
        [18, 11],
        [18, 11],
      ],
    },
    at([12, 5]),
  ],
  // A paper plane, folded from the arrow: its outline from the left wing to the nose and down to
  // its keel, and the fold from the keel to the nose.
  plane: [
    {
      points: [
        [3, 10],
        [21, 3],
        [14, 21],
        [11, 13],
      ],
    },
    {
      points: [
        [11, 13],
        [21, 3],
        [21, 3],
        [21, 3],
      ],
    },
    {
      points: [
        [3, 10],
        [11, 13],
        [11, 13],
        [11, 13],
      ],
    },
  ],
} satisfies Record<string, Glyph>

export type GlyphName = keyof typeof glyphs

export const pathOf = (stroke: Stroke) => {
  const [a, b, c, d] = stroke.points
  return `M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}L${d[0]} ${d[1]}`
}
