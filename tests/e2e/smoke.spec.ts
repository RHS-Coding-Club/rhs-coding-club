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
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Overview')
})
