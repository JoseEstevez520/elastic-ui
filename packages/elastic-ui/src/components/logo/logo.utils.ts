/** A brand's mark as Simple Icons gives it (`siVuedotjs`), or any icon of the same shape. */
export interface LogoIcon {
  title: string
  /** An SVG path in a 24×24 box. */
  path: string
  /** Its own colour, as six hex digits without the `#`. */
  hex?: string
}

// The page's ground in each theme (--color-bg), as relative luminance.
const LIGHT_GROUND = 0.913
const DARK_GROUND = 0.003
// Below WCAG's 3:1 for graphics, which most brands miss on white, but enough for the mark to stand
// off the ground; a colour under it (JavaScript's yellow on light, GitHub's black on dark) gives
// way to the text's.
const MIN_CONTRAST = 2

function luminance(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

/**
 * A brand's colour where it reads on the theme's ground, and the text's colour where it does not,
 * as one `light-dark()` value; `undefined` without a colour.
 */
export function logoColor(hex?: string): string | undefined {
  if (!hex || !/^[0-9a-f]{6}$/i.test(hex)) return undefined
  const l = luminance(hex)
  const light = contrast(l, LIGHT_GROUND) >= MIN_CONTRAST ? `#${hex}` : 'var(--color-fg)'
  const dark = contrast(l, DARK_GROUND) >= MIN_CONTRAST ? `#${hex}` : 'var(--color-fg)'
  return light === dark ? light : `light-dark(${light}, ${dark})`
}
