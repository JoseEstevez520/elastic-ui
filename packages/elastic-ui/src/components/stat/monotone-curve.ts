export interface CurvePoint {
  x: number
  y: number
}

/**
 * A smooth curve through the given points that never swings past a value it passes through:
 * Fritsch–Carlson's monotone cubic Hermite spline, the algorithm behind d3's `curveMonotoneX`,
 * written out by hand (see "Monotone cubic interpolation", Wikipedia) so the sparkline's line
 * reads as one continuous shape instead of straight jagged segments.
 *
 * Returns an SVG path's `d`: a single `M` followed by one cubic Bézier `C` per segment.
 */
export function monotonePath(points: CurvePoint[]): string {
  const n = points.length
  if (n === 0) return ''
  if (n === 1) return `M${fmt(points[0].x)},${fmt(points[0].y)}`

  // Each segment's own secant slope, and every point's tangent starting as the average of the
  // secants either side of it (the two ends just take their one neighbour's).
  const secants: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x
    secants.push(dx === 0 ? 0 : (points[i + 1].y - points[i].y) / dx)
  }

  const tangents: number[] = new Array(n)
  tangents[0] = secants[0]
  tangents[n - 1] = secants[n - 2]
  for (let i = 1; i < n - 1; i++) tangents[i] = (secants[i - 1] + secants[i]) / 2

  // Flatten a tangent where the curve would change direction against its own segment, and cap it
  // where it would otherwise overshoot: the Fritsch–Carlson monotonicity constraint.
  for (let i = 0; i < n - 1; i++) {
    const s = secants[i]
    if (s === 0) {
      tangents[i] = 0
      tangents[i + 1] = 0
      continue
    }
    const a = tangents[i] / s
    const b = tangents[i + 1] / s
    if (a < 0) tangents[i] = 0
    if (b < 0) tangents[i + 1] = 0
    const sum = a * a + b * b
    if (sum > 9) {
      const t = 3 / Math.sqrt(sum)
      tangents[i] = t * a * s
      tangents[i + 1] = t * b * s
    }
  }

  let d = `M${fmt(points[0].x)},${fmt(points[0].y)}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const h = (p1.x - p0.x) / 3
    const c1x = p0.x + h
    const c1y = p0.y + h * tangents[i]
    const c2x = p1.x - h
    const c2y = p1.y - h * tangents[i + 1]
    d += `C${fmt(c1x)},${fmt(c1y)} ${fmt(c2x)},${fmt(c2y)} ${fmt(p1.x)},${fmt(p1.y)}`
  }
  return d
}

function fmt(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : '0'
}
