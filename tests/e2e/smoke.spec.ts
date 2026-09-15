import { expect, test } from '@playwright/test'

const PASSWORD = 'password123'

test('home page renders the hero', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn to code')
  await expect(page.getByRole('link', { name: 'Join the club' })).toBeVisible()
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

test('home shows the next event and stats', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Next up')).toBeVisible()
  await expect(page.getByText('First Meeting')).toBeVisible()
  await expect(page.getByText('shipped projects')).toBeVisible()
})

test('theme toggle persists across reloads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await expect(page.locator('html')).toHaveClass(/light/)
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
