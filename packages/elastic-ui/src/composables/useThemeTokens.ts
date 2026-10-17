import { onBeforeUnmount, onMounted, ref } from 'vue'

export interface ThemeTokens {
  dark: boolean
  /** The tokens as `--name: value;` declarations, every colour resolved for this theme. */
  declarations: string
}

// The tokens worth carrying to a document of its own: colours, fonts, radii and type sizes.
const CARRIED = /^--(color|font|radius|text)-/

// Their names, read once from the page's own stylesheets (Tailwind puts them on `:root`), so the
// library need not ship a copy of tokens.css in its code.
let names: string[] | undefined
function tokenNames(): string[] {
  if (names) return names
  const found = new Set<string>()
  const visit = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule && rule.selectorText.includes(':root')) {
        for (const name of rule.style) if (CARRIED.test(name)) found.add(name)
      } else if ('cssRules' in rule) visit((rule as CSSGroupingRule).cssRules)
    }
  }
  for (const sheet of document.styleSheets) {
    try {
      visit(sheet.cssRules)
    } catch {
      // A stylesheet from another origin cannot be read; the tokens are never in one.
    }
  }
  names = [...found]
  return names
}

function isDark() {
  const forced = document.documentElement.dataset.theme
  if (forced === 'dark' || forced === 'light') return forced === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function read(): ThemeTokens {
  const style = getComputedStyle(document.documentElement)
  // Colours hold both themes in light-dark(): read through an element, they come out resolved.
  const probe = document.createElement('span')
  probe.style.display = 'none'
  document.body.append(probe)
  const declarations = tokenNames()
    .map((name) => {
      let value = style.getPropertyValue(name).trim()
      if (name.startsWith('--color-')) {
        probe.style.color = `var(${name})`
        value = getComputedStyle(probe).color
      }
      return value ? `${name}: ${value};` : ''
    })
    .join(' ')
  probe.remove()
  return { dark: isDark(), declarations }
}

/**
 * The library's tokens as they stand in the current theme, resolved to plain values, for what
 * is drawn outside the page's own DOM and cannot read its CSS: an SVG shown as an image, a
 * sandboxed frame. Read once mounted, and again when the theme changes, by ThemeToggle
 * (`data-theme`) or the system.
 */
export function useThemeTokens() {
  const tokens = ref<ThemeTokens>()
  let observer: MutationObserver | undefined
  let media: MediaQueryList | undefined
  // A frame later, once the new theme has been applied.
  const update = () =>
    requestAnimationFrame(() => {
      const next = read()
      if (next.declarations !== tokens.value?.declarations || next.dark !== tokens.value?.dark) tokens.value = next
    })
  onMounted(() => {
    tokens.value = read()
    observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', update)
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    media?.removeEventListener('change', update)
  })
  return tokens
}
