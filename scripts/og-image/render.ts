/**
 * Renders scripts/og-image/og.html to public/og.png with Playwright's Chromium.
 *
 *   bun run og:render
 */
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const source = new URL('./og.html', import.meta.url).href
const target = fileURLToPath(new URL('../../public/og.png', import.meta.url))

const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  await page.goto(source, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.body.dataset.ready === 'true')
  await page.screenshot({ path: target })
  console.log(`Wrote ${target}`)
} finally {
  await browser.close()
}
