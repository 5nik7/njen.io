import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('the intro reveals the name, returns to NJEN, then draws the frame and IO', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.clock.install()
  await page.goto('/')
  await page.waitForSelector('.wordmark-glyph')
  await page.clock.runFor(300)
  await expect(page.locator('[data-outer-frame]')).toHaveCSS('opacity', '0')
  await expect(page.locator('.theme-switch')).toBeHidden()
  await page.clock.runFor(1700)
  await expect(page.locator('.wordmark')).toHaveAttribute('data-intro-phase', 'name-hold')
  await expect(page.locator('.wordmark')).toHaveAttribute('data-progress', '1.0000')
  await page.clock.runFor(2300)
  await expect(page.locator('.wordmark')).toHaveAttribute('data-intro-phase', 'complete')
  await expect(page.locator('.wordmark')).toHaveAttribute('data-progress', '0.0000')
  await expect(page.locator('[data-outer-frame]')).toHaveCSS('opacity', '1')
  await expect(page.getByRole('button', { name: 'IO: Switch to light mode' })).toBeVisible()
  await page.clock.runFor(10_000)
  await expect(page.locator('.wordmark')).toHaveAttribute('data-progress', '0.0000')
  expect(errors).toEqual([])
})

test('name toggling moves only the sun or moon to the corner', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const name = page.getByRole('button', { name: 'NJEN. Expand to Nick Jensen' })
  const socialsBefore = await page.locator('.social-links').boundingBox()
  await name.click()
  await expect(page.getByRole('button', { name: 'Nick Jensen. Collapse to NJEN' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.theme-switch')).toHaveAttribute('data-location', 'corner')
  await expect(page.locator('.theme-i')).toHaveCSS('opacity', '0')
  const corner = await page.locator('.theme-switch').boundingBox()
  expect(corner!.y).toBeGreaterThanOrEqual(0)
  expect(corner!.y).toBeLessThanOrEqual(20)
  expect(corner!.width).toBeGreaterThanOrEqual(44)
  expect(corner!.height).toBeGreaterThanOrEqual(44)
  expect(await page.locator('.social-links').boundingBox()).toEqual(socialsBefore)
  await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('.wordmark')).toHaveAttribute('data-progress', '1.0000')
  await page.getByRole('button', { name: 'Nick Jensen. Collapse to NJEN' }).click()
  await expect(page.locator('.theme-switch')).toHaveAttribute('data-location', 'inline')
  await expect(page.locator('.theme-i')).toHaveCSS('opacity', '1')
})

test('keyboard, default dark mode, saved choice, and contact links work', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.keyboard.press('Tab')
  await expect(page.locator('.wordmark-toggle')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('.wordmark')).toHaveAttribute('data-progress', '1.0000')
  await page.keyboard.press('Escape')
  await expect(page.locator('.wordmark')).toHaveAttribute('data-progress', '0.0000')
  await page.keyboard.press('Tab')
  await expect(page.locator('.theme-switch')).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', 'https://github.com/5nik7')
  await expect(page.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute('href', 'https://www.linkedin.com/in/5nik7')
  await expect(page.getByRole('link', { name: 'Email Nick', exact: true })).toHaveAttribute('href', 'mailto:contact@njen.io')
  for (const link of await page.locator('.social-link').all()) {
    const box = await link.boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
})

test('expanded lettering fits its frame and viewport after narrow resizing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('.wordmark-toggle').click()
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 800 })
    await expect.poll(async () => page.evaluate(() => {
      const frame = document.querySelector('[data-outer-frame]')!.getBoundingClientRect()
      const glyphs = [...document.querySelectorAll('.wordmark-glyph')].map(el => el.getBoundingClientRect()).sort((a, b) => a.x - b.x)
      return {
        fits: frame.x >= 0 && frame.right <= innerWidth && document.documentElement.scrollWidth <= innerWidth,
        contained: glyphs.every(g => g.x >= frame.x && g.right <= frame.right && g.y >= frame.y && g.bottom <= frame.bottom),
        separate: glyphs.every((g, index) => index === 0 || g.x >= glyphs[index - 1]!.right - 0.1),
      }
    })).toEqual({ fits: true, contained: true, separate: true })
  }
})

test('interruption and a changing reduced-motion preference settle cleanly', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.waitForSelector('.wordmark-glyph')
  await page.clock.runFor(400)
  await page.locator('.wordmark-toggle').click({ force: true })
  await page.clock.runFor(300)
  await page.locator('.wordmark-toggle').click({ force: true })
  await page.clock.runFor(1000)
  await expect(page.locator('.wordmark')).toHaveAttribute('data-progress', '0.0000')
  await page.locator('.wordmark-toggle').click({ force: true })
  await page.clock.runFor(200)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.wordmark')).toHaveAttribute('data-progress', '1.0000')
  await page.clock.runFor(5000)
  await expect(page.locator('.wordmark')).toHaveAttribute('data-progress', '1.0000')
})

test('both themes and name states have no automated accessibility violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  for (const expanded of [false, true]) {
    if (expanded) await page.locator('.wordmark-toggle').click()
    for (let theme = 0; theme < 2; theme++) {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(result.violations).toEqual([])
      await page.locator('.theme-switch').click()
    }
  }
})

test('contact information stays available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4173/')
  await expect(page.getByRole('heading', { name: 'NICK JENSEN' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:contact@njen.io')
  await context.close()
})
