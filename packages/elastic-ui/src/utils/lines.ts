/** A line of code with a key that stays with it while the code around it changes. */
export interface KeyedLine {
  key: number
  text: string
}

/**
 * Carries the keys of `previous` over to `next`: the lines both share, in the same order (their
 * longest common subsequence), keep their keys; the rest are new. So a line that stays is the
 * same element and only moves, while lines added or removed come and go around it.
 */
export function keyLines(previous: KeyedLine[], next: string[], newKey: () => number) {
  const n = previous.length
  const m = next.length
  // lengths[i][j]: the longest common run of previous[i..] and next[j..].
  const lengths = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      lengths[i]![j] =
        previous[i]!.text === next[j] ? lengths[i + 1]![j + 1]! + 1 : Math.max(lengths[i + 1]![j]!, lengths[i]![j + 1]!)

  const lines: KeyedLine[] = []
  const added = new Set<number>()
  let i = 0
  let j = 0
  while (j < m) {
    if (i < n && previous[i]!.text === next[j]) {
      lines.push(previous[i]!)
      i++
      j++
    } else if (i < n && lengths[i + 1]![j]! >= lengths[i]![j + 1]!) {
      i++
    } else {
      const key = newKey()
      lines.push({ key, text: next[j]! })
      added.add(key)
      j++
    }
  }
  return { lines, added }
}

/** "2-4, 7" → the line numbers 2, 3, 4 and 7, counted from 1. */
export function parseLineRanges(ranges: string | undefined) {
  const numbers = new Set<number>()
  for (const part of ranges?.split(',') ?? []) {
    const [from, to = from] = part.split('-').map((n) => Number.parseInt(n, 10))
    if (from === undefined || Number.isNaN(from) || to === undefined || Number.isNaN(to)) continue
    for (let n = from; n <= to; n++) numbers.add(n)
  }
  return numbers
}

/** One line of a diff: in both versions, only in the old one, or only in the new one. */
export interface DiffLine {
  type: 'same' | 'removed' | 'added'
  text: string
}

/** The lines of `before` and `after` as a unified diff, the shared lines found as in `keyLines`. */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.replace(/\n$/, '').split('\n')
  const b = after.replace(/\n$/, '').split('\n')
  const lengths = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      lengths[i]![j] = a[i] === b[j] ? lengths[i + 1]![j + 1]! + 1 : Math.max(lengths[i + 1]![j]!, lengths[i]![j + 1]!)

  const lines: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      lines.push({ type: 'same', text: a[i]! })
      i++
      j++
    } else if (j >= b.length || (i < a.length && lengths[i + 1]![j]! >= lengths[i]![j + 1]!)) {
      lines.push({ type: 'removed', text: a[i]! })
      i++
    } else {
      lines.push({ type: 'added', text: b[j]! })
      j++
    }
  }
  return lines
}
