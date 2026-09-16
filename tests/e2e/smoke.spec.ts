import { expect, test } from '@playwright/test'

const PASSWORD = 'password123'

test('home page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn to code.')
  await expect(page.getByRole('link', { name: 'Join the club' }).first()).toBeVisible()
})

test('footer newsletter form subscribes an email', async ({ page }) => {
  await page.goto('/')
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`
  const input = page.getByLabel('Newsletter signup')
  await input.scrollIntoViewIfNeeded()
  // Submits before hydration do nothing, so retry until the success text lands.
  await expect(async () => {
    await input.fill(email)
    await page.getByRole('button', { name: 'Subscribe' }).click()
    await expect(page.getByText('You are on the list')).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 15_000 })
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

test('theme toggle persists across reloads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/dark/)
  // The toggle flips the class immediately and persists the cookie in the
  // background; wait for that request so the reload does not cancel it.
  const persisted = page.waitForResponse(
    (res) => res.request().method() === 'POST' && res.ok(),
  )
  // Clicks before hydration do nothing, so retry until the class flips.
  await expect(async () => {
    await page.getByRole('button', { name: 'Switch to light theme' }).click()
    await expect(page.locator('html')).toHaveClass(/light/, { timeout: 500 })
  }).toPass({ timeout: 15_000 })
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
