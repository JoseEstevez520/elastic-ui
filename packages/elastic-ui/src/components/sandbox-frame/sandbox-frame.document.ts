import { diagramSheet } from '../diagram/diagram.sheet'

/** What the frame says to the page, and the page to the frame. */
export const FRAME_HEIGHT = 'elastic-ui:frame-height'
export const FRAME_THEME = 'elastic-ui:frame-theme'

// No network from inside: only its own inline code and data URLs. First in its head, before
// anything of its own can run. A piece made of the library's parts may also load the runtime, from
// that one address, and compile its template (Vue's compiler builds its render function with
// `new Function`, hence `unsafe-eval`; inline code can already run anything, so this lets it do
// nothing more).
const policy = (runtime?: string) =>
  `default-src 'none'; script-src 'unsafe-inline'${runtime ? ` 'unsafe-eval' ${runtime}` : ''}; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:`

// Plain elements in the library's type and controls, so a piece looks native without a class.
const BASE = `
html, body { margin: 0; background: var(--color-bg-subtle); color: var(--color-fg); font-family: var(--font-sans); font-size: 14px; line-height: 1.5; }
body { padding: 16px; }
*, *::before, *::after { box-sizing: border-box; }
code, pre, kbd { font-family: var(--font-mono); font-size: 0.8125em; }
button { font: inherit; font-weight: 500; border: 0; border-radius: var(--radius-md); padding: 0.4rem 0.8rem; background: var(--color-accent); color: var(--color-accent-fg); cursor: pointer; }
button:hover { background: var(--color-accent-hover); }
button:disabled { opacity: 0.5; cursor: default; }
input, select, textarea { font: inherit; color: inherit; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0.35rem 0.6rem; }
input[type="range"], input[type="checkbox"], input[type="radio"] { accent-color: var(--color-accent); padding: 0; }
`

// Inside the frame: it tells the page its height whenever that changes, and takes a new theme
// into its stylesheet without reloading, so what has been done in it stays. The height is the
// content's: the root's own box, or the body's content where the piece pins the root to the frame
// (`height: 100%`), so it grows and shrinks with what it holds.
const SCRIPT = `(() => {
  const theme = document.getElementById('elastic-ui-theme')
  addEventListener('message', (e) => {
    if (e.source === parent && e.data && e.data.type === '${FRAME_THEME}') theme.textContent = e.data.css
  })
  let last = -1
  const report = () => {
    const body = document.body
    let height = document.documentElement.getBoundingClientRect().height
    if (body) {
      const style = getComputedStyle(body)
      height = Math.max(height, body.scrollHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom))
    }
    height = Math.ceil(height)
    if (height === last) return
    last = height
    parent.postMessage({ type: '${FRAME_HEIGHT}', height }, '*')
  }
  const observer = new ResizeObserver(report)
  observer.observe(document.documentElement)
  addEventListener('DOMContentLoaded', () => { observer.observe(document.body); report() })
  addEventListener('load', report)
})()`

/** The theme's tokens as the frame's root stylesheet. */
export const themeSheet = (declarations: string, dark: boolean) =>
  `:root { ${declarations} color-scheme: ${dark ? 'dark' : 'light'}; }`

/**
 * The piece's HTML as a document of its own, whole or a fragment: the policy, the theme, the base
 * styles and the frame's script in a head of its own, before anything of the piece's. Its own
 * `<html>` and `<head>` merge into these as the parser goes; only its doctype is dropped, since
 * nothing may come before it.
 */
export function frameDocument(html: string, theme: string) {
  return `<!doctype html><html><head>${head(theme, BASE)}</head>${html.replace(/^\s*<!doctype[^>]*>/i, '')}`
}

const head = (theme: string, base: string, runtime?: string) =>
  `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy(runtime)}">` +
  `<meta name="viewport" content="width=device-width, initial-scale=1">` +
  `<style id="elastic-ui-theme">${theme}</style><style>${base}${diagramSheet}</style><script>${SCRIPT}</script>`

/**
 * The runtime's address as the policy and the script take it: absolute (the frame has no origin
 * of its own to resolve it against) and with nothing that could end the policy's directive.
 */
export function runtimeAddress(url: string): string | undefined {
  try {
    const href = new URL(url, location.href).href
    return /^https?:/.test(href) && !/[\s;,'"]/.test(href) ? href : undefined
  } catch {
    return undefined
  }
}

/**
 * A piece made of the library's parts, a Vue component written as a single-file component, as a
 * document: the runtime, loaded from the host, mounts it with the library's texts in the page's
 * language. The runtime brings its own stylesheet, so no plain-element styles here.
 */
export function pieceDocument(piece: string, theme: string, runtime: string | undefined, labels: object) {
  // As JSON in a script, with `<` escaped so nothing in the piece can close the script early.
  const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')
  const mount =
    `if (window.ElasticUiSandbox) ElasticUiSandbox.mount(${json(piece)}, { labels: ${json(labels)} });` +
    `else document.getElementById('app').textContent = 'The library\\'s runtime could not be loaded.'`
  return (
    `<!doctype html><html><head>${head(theme, '', runtime)}` +
    (runtime ? `<script src="${runtime}"></script>` : '') +
    `</head><body><div id="app"></div><script>${mount}</script></body></html>`
  )
}
