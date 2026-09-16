import { expect, test } from '@playwright/test'

const PASSWORD = 'password123'

test('home page renders the hero', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Keep score')
  // Hero CTA (pricing and the closing band repeat the same link further down).
  await expect(page.getByRole('link', { name: 'Join the club' }).first()).toBeVisible()
})

test('unauthenticated dashboard redirects to login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})

test('member can log in and reach the dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('member@test.local')
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hey, Max')
})

test('member is kept out of admin', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('member@test.local')
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/dashboard/)
})

test('officer reaches admin', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('officer@test.local')
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.goto('/admin')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/waiting|caught up/)
})

test('about page lists officers from the database', async ({ page }) => {
  await page.goto('/about')
  await expect(
    page.getByRole('heading', { level: 2, name: 'The people running it' }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Jashan Maan' })).toBeVisible()
})

test('home renders live product UI from the database', async ({ page }) => {
  await page.goto('/')
  // The hero app frame shows the next event and this week's challenge.
  await expect(
    page.getByRole('heading', { level: 3, name: 'First Meeting' }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 3, name: 'Build a tiny URL shortener' }).first(),
  ).toBeVisible()
  await expect(page.getByText('projects shipped')).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Simple pricing.' }),
  ).toBeVisible()
})

test('theme toggle persists across reloads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/dark/)
  // The poster gradient (WebGL) only mounts on the client, so its canvas proves hydration finished.
  await page.locator('canvas').first().waitFor({ timeout: 15_000 })
  // The toggle flips the class immediately and persists the cookie in the
  // background; wait for that request so the reload does not cancel it.
  const persisted = page.waitForResponse(
    (res) => res.request().method() === 'POST' && res.ok(),
  )
  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await expect(page.locator('html')).toHaveClass(/light/)
  await persisted
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/light/)
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('admin overview shows pending queues', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('admin@test.local')
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.goto('/admin')
  await expect(page.getByRole('link', { name: /Projects to approve/ })).toBeVisible()
})
