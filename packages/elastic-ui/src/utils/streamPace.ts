import { prefersReducedMotion } from './motion'

/**
 * The pace at which a streamed answer is shown, the way AI chats now smooth it. A model sends its
 * text in bursts and pauses; shown as it lands it reads as jolts. Instead the text is revealed at
 * a steady pace that follows how fast text arrives (averaged), keeping a small cushion of it
 * unshown so the model's pauses are absorbed instead of showing as stops (as llm-ui and
 * Streamdown do). Short of the cushion it slows, past it it speeds up, never halting while there
 * is text left to show; once the model is done, or has paused, what is held back comes in at
 * once, so the end never lags behind.
 *
 * It only counts characters: what to draw with them (plain words coming into focus in
 * `ChatStream`, Markdown or a program drawn by something else) is the caller's. `onFrame` is
 * called with how many characters to show, on every animation frame while that changes.
 */
export interface StreamPace {
  /** The text so far, and whether more is coming. */
  update(text: string, streaming: boolean): void
  /** How many characters are on show. */
  readonly shown: number
  /** Whether the model has sent nothing for a moment (its last word is most likely whole). */
  readonly quiet: boolean
  stop(): void
}

export interface StreamPaceOptions {
  onFrame: (shown: number) => void
  /** Called once everything sent is on show. */
  onCaughtUp?: () => void
  /** Called when the model goes quiet (see `quiet`). */
  onQuiet?: () => void
  /** Show what is already there at once (an answer there when the page opened). */
  startShown?: boolean
}

const CUSHION = 24 // characters
const CATCH_UP = 1500 // ms to close the gap to the cushion
const STARTING_RATE = 0.12 // characters a millisecond, before any has been measured
// A whole answer, or what is left once the model is done, comes in over about this long.
const FLUSH = 600
// The model has sent nothing for this long: what was sent is likely whole.
const QUIET = 300

export function createStreamPace({ onFrame, onCaughtUp, onQuiet, startShown = false }: StreamPaceOptions): StreamPace {
  let text = ''
  let streaming = false
  let exact = 0
  let shown = 0
  let rate = STARTING_RATE
  let lastArrival = 0
  let lastLength = 0
  let quiet = false
  let quietTimer: ReturnType<typeof setTimeout> | undefined
  let frame = 0
  let last = 0
  let first = true

  const show = (n: number) => {
    if (n === shown) return
    shown = n
    onFrame(n)
  }

  function run() {
    // Without motion, or rendering on the server, the text simply shows.
    if (typeof requestAnimationFrame === 'undefined' || prefersReducedMotion()) {
      exact = text.length
      show(text.length)
      onCaughtUp?.()
      return
    }
    if (frame) return
    last = performance.now()
    const step = (now: number) => {
      const dt = now - last
      last = now
      const pending = text.length - exact
      if (pending <= 0) {
        frame = 0
        onCaughtUp?.()
        return
      }
      const speed =
        streaming && !quiet ? Math.max(rate * 0.25, rate + (pending - CUSHION) / CATCH_UP) : Math.max(rate, pending / FLUSH)
      exact = Math.min(text.length, exact + speed * dt)
      show(Math.floor(exact))
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  }

  return {
    update(next, isStreaming) {
      if (first) {
        first = false
        if (startShown) {
          exact = next.length
          shown = next.length
          lastLength = next.length
        }
      }
      // A text that isn't a continuation (a new answer) starts over.
      if (!next.startsWith(text.slice(0, Math.min(text.length, 40)))) {
        exact = 0
        shown = 0
        lastLength = 0
      }
      const now = performance.now()
      if (lastArrival && next.length > lastLength) {
        const measured = (next.length - lastLength) / Math.max(16, now - lastArrival)
        rate = 0.8 * rate + 0.2 * measured
      }
      if (next.length !== lastLength) {
        lastArrival = now
        quiet = false
        clearTimeout(quietTimer)
        quietTimer = setTimeout(() => {
          quiet = true
          onQuiet?.()
          run()
        }, QUIET)
      }
      lastLength = next.length
      text = next
      streaming = isStreaming
      run()
    },
    get shown() {
      return shown
    },
    get quiet() {
      return quiet
    },
    stop() {
      cancelAnimationFrame(frame)
      frame = 0
      clearTimeout(quietTimer)
    },
  }
}

/**
 * How much of `text` to draw when `shown` characters are on show: whole words only, never a few
 * letters of one. While it streams, the last word may still be growing (a model splits words
 * across bursts), so it waits for the space after it, unless it ends a sentence or the model has
 * paused (`quiet`); once done, whatever is revealed runs to the end of its word.
 */
export function wholeWords(text: string, shown: number, streaming: boolean, quiet: boolean): string {
  const revealed = text.slice(0, shown)
  const whole = shown >= text.length && (quiet || /[.!?:;…)\]"'”]$/.test(text))
  if (streaming && !whole) {
    const lastSpace = revealed.search(/\s\S*$/)
    return lastSpace === -1 ? '' : revealed.slice(0, lastSpace)
  }
  const next = text.slice(shown).search(/\s/)
  return next === -1 ? text : text.slice(0, shown + next)
}
