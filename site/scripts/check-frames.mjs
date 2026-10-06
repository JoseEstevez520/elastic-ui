#!/usr/bin/env node
/*
 * Checks every story on the built site the way a visitor sees it, at a desktop's width and a
 * phone's, so a part that does not fit its frame is caught here rather than by eye, part by part.
 * Run after `npm run build` (`npm run check` does both). For each part's page, with every example
 * and situation open:
 *
 * - The page must not scroll sideways.
 * - A story must fit its frame across (StoryFrame shrinks a wide one, down to a point: past it, this
 *   fails), and a story of the page itself, in its iframe, must not scroll sideways there.
 * - Nothing may throw, and nothing may log an error. A resource the network could not reach is only
 *   reported, since it says nothing about the site.
 *
 * Exits with 1 when anything fails. `--only <slug,slug>` checks just those parts. The browser is
 * Playwright's own (`npx playwright install chromium`), or the one at CHROMIUM_PATH.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { preview } from 'vite'

const siteRoot = fileURLToPath(new URL('..', import.meta.url))
const onlyAt = process.argv.indexOf('--only')
const only = onlyAt > 0 ? process.argv[onlyAt + 1]?.split(',') : undefined
const parts = JSON.parse(readFileSync(new URL('../generated/parts.json', import.meta.url), 'utf8')).filter(
  (part) => !only || only.includes(part.slug),
)

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 800 } },
  { name: 'phone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
]
// The least a story may be shrunk to fit before it counts as not fitting (story-fit.ts stops here).
const MIN_ZOOM = 0.5
const NETWORK = /net::ERR_|Failed to load resource/

const server = await preview({ root: siteRoot, preview: { port: 0, strictPort: false }, logLevel: 'error' })
const base = server.resolvedUrls.local[0].replace(/\/$/, '')
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })

const failures = []
const notes = []
for (const { name: view, ...options } of VIEWPORTS) {
  const context = await browser.newContext(options)
  for (const part of parts) {
    const page = await context.newPage()
    const where = `${view} ${part.slug}`
    const fail = (message) => failures.push(`${where}: ${message}`)
    page.on('pageerror', (error) => fail(`threw: ${error.message.split('\n')[0]}`))
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      if (NETWORK.test(message.text())) notes.push(`${where}: ${message.text().slice(0, 120)}`)
      else fail(`logged: ${message.text().split('\n')[0].slice(0, 160)}`)
    })

    await page.goto(`${base}/components/${part.slug}`, { waitUntil: 'networkidle' })
    // Every example and situation, not just the first.
    const more = page.getByText(/^Every example and the API/)
    // Clicked from the page itself: a story may open a panel over the trigger as it mounts.
    if (await more.count()) await more.first().evaluate((trigger) => trigger.click())
    // Stories of the page load their iframe only near the view; here all of them, now.
    await page.evaluate(() => document.querySelectorAll('iframe').forEach((frame) => (frame.loading = 'eager')))
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1200)

    const report = await page.evaluate(() => {
      const stories = [...document.querySelectorAll('article section')].map((section) => {
        const title = section.querySelector('h2, h3')?.textContent?.trim() ?? '?'
        const content = section.querySelector('.story-content')
        if (content) {
          const zoom = Number(getComputedStyle(content).zoom) || 1
          return { title, overflow: content.scrollWidth - content.clientWidth, zoom }
        }
        const frame = section.querySelector('iframe')
        const doc = frame?.contentDocument?.documentElement
        if (doc) return { title, overflow: doc.scrollWidth - doc.clientWidth, zoom: 1, frame: true }
        return { title, missing: !frame }
      })
      return { pageOverflow: document.documentElement.scrollWidth - innerWidth, stories }
    })
    if (report.pageOverflow > 1) fail(`the page scrolls sideways by ${report.pageOverflow}px`)
    for (const story of report.stories) {
      if (story.missing) continue
      if (story.overflow > 1) fail(`"${story.title}" is ${story.overflow}px wider than its ${story.frame ? 'page' : 'frame'}`)
      else if (story.zoom <= MIN_ZOOM) fail(`"${story.title}" only fits shrunk to ${Math.round(story.zoom * 100)}%`)
    }
    await page.close()
  }
  await context.close()
}

await browser.close()
await new Promise((resolve) => server.httpServer.close(resolve))

for (const note of [...new Set(notes)]) console.log(`note  ${note}`)
for (const failure of failures) console.log(`FAIL  ${failure}`)
console.log(`\n${parts.length} parts at ${VIEWPORTS.length} widths: ${failures.length ? `${failures.length} failing` : 'all fit'}`)
process.exit(failures.length ? 1 : 0)
