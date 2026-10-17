// Letters and digits, with the apostrophes and hyphens that belong inside a word.
const WORD_CHAR = /[\p{L}\p{N}'’-]/u

/**
 * Grows each end of a range out to a whole word, so half-selecting a word takes the complete
 * word. Taken from Curio's reading view.
 */
export function expandToWords(range: Range) {
  const { startContainer, endContainer } = range
  if (startContainer.nodeType === Node.TEXT_NODE) {
    const text = startContainer.textContent ?? ''
    let start = range.startOffset
    while (start > 0 && WORD_CHAR.test(text[start - 1]!)) start--
    range.setStart(startContainer, start)
  }
  if (endContainer.nodeType === Node.TEXT_NODE) {
    const text = endContainer.textContent ?? ''
    let end = range.endOffset
    while (end < text.length && WORD_CHAR.test(text[end]!)) end++
    range.setEnd(endContainer, end)
  }
}

export interface Line {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * A range's boxes, one per line. The browser gives one box per inline piece (a word, a space,
 * a link), so boxes that share a line are merged: the band is one piece per line, rounded only
 * at its ends, instead of a row of little pills.
 */
export function lines(range: Range): Line[] {
  const merged: Line[] = []
  for (const box of range.getClientRects()) {
    if (!box.width || !box.height) continue
    const last = merged.at(-1)
    if (last && box.top < last.bottom - 2 && box.bottom > last.top + 2) {
      last.left = Math.min(last.left, box.left)
      last.top = Math.min(last.top, box.top)
      last.right = Math.max(last.right, box.right)
      last.bottom = Math.max(last.bottom, box.bottom)
    } else {
      merged.push({ left: box.left, top: box.top, right: box.right, bottom: box.bottom })
    }
  }
  return merged
}
