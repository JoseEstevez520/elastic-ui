import { cva } from 'class-variance-authority'

export const chatMessageVariants = /* @__PURE__ */ cva(
  '[overflow-wrap:anywhere] text-copy whitespace-pre-wrap text-fg',
  {
    variants: {
      role: {
        // A soft, round bubble with no border, taking at most most of the row.
        user: [
          'ml-auto w-fit max-w-[80%] rounded-3xl bg-[color:var(--chat-bubble,var(--color-bg-muted))] px-4 py-2.5',
          // Plain by default; over colour (an Aurora) the tokens make it frosted glass.
          '[box-shadow:var(--chat-bubble-shadow,none)] [backdrop-filter:blur(var(--chat-bubble-blur,0px))]',
        ],
        assistant: 'max-w-full',
      },
    },
  },
)

// The composer, as Curio's: a filled pill and a round button of the same fill beside it. At rest
// the button sits under the pill's end and the two read as one; once there is something to send
// the pill makes room and the button separates from it, like a drop. The fill is drawn on a layer
// of its own (see ChatComposer), so the field and the button themselves are transparent.
export const composerFieldClass = [
  'relative min-h-11 max-h-48 w-full resize-none rounded-3xl bg-transparent px-4 py-[11px] text-copy leading-normal text-fg outline-none',
  'placeholder:text-fg-faint field-sizing-content overflow-y-auto scrollbar-subtle',
  '[transition:margin-right_0.5s_var(--ease-glide)] motion-reduce:transition-none',
]
/** The pill's shape, following the field as it makes room. */
export const composerShapeClass = 'bg-black [transition:right_0.5s_var(--ease-glide)] motion-reduce:transition-none'
/** The button and its shape pull out together. */
export const composerDropClass = 'transition-[translate] duration-500 ease-glide motion-reduce:transition-none'
export const composerButtonClass = [
  'flex size-11 cursor-pointer items-center justify-center rounded-full text-fg transition-colors duration-150',
  'focus-ring',
]

/** A step's line: quiet text, as wide as it needs, that only reads as a button once it opens. */
export const chatToolTriggerClass = [
  'group/tool flex w-fit max-w-full items-center gap-2 rounded-md text-left enabled:cursor-pointer',
  'focus-ring',
]

/** The fine thread what a step holds hangs from, down from under its icon. */
export const chatThreadLineClass =
  'ml-[7px] border-l border-[color:var(--chat-line,color-mix(in_oklab,var(--color-fg)_12%,transparent))] pl-4'

// No box: a line of text, brightening under the pointer.
export const chatSourceClass = [
  'group/source flex min-w-0 items-center gap-2.5 rounded-sm py-0.5 text-ui',
  'focus-ring',
]

// Over the aurora, the composer and your messages turn to glass (the library's glass material,
// `--glass-*`). Set through the chat's tokens, so a project can still override them.
export const chatGlassStyle = {
  '--chat-composer-bg': 'var(--glass-bg)',
  '--chat-bubble': 'var(--glass-bg)',
  '--chat-composer-shadow': 'drop-shadow(0 2px 6px rgb(0 0 0 / 0.04))',
  '--chat-bubble-shadow': 'var(--glass-shadow)',
  '--chat-bubble-blur': 'var(--glass-blur)',
}

/**
 * A disclosure that folds on an even curve rather than the quick start of the others, so a large
 * piece (an edit) goes softly, blurring away as its room closes.
 */
export const chatToolContentClass = [
  'overflow-hidden motion-reduce:animate-none',
  'data-[state=open]:animate-disclosure-open data-[state=closed]:animate-[disclosure-close_0.4s_var(--ease-in-out)]',
]
