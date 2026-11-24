import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const PASSWORD = 'password123'

/**
 * Signs in through the real form. Waits for hydration first (a pre-hydration
 * submit is a native GET that goes nowhere) and for the redirect after, so
 * the next navigation carries the session.
 */
async function logIn(page: Page, email: string) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

test('home page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Learn to code.')
  await expect(page.getByRole('link', { name: 'Join the club' }).first()).toBeVisible()
})

test('footer newsletter form subscribes an email', async ({ page }) => {
  await page.goto('/')
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`
  const input = page.getByLabel('Email for the newsletter')
  await input.scrollIntoViewIfNeeded()
  // Submits before hydration do nothing, so retry until the success text lands.
  await expect(async () => {
    await input.fill(email)
    await page.getByRole('button', { name: 'Subscribe' }).click()
    await expect(page.getByText("You're on the list")).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 15_000 })
})

test('unauthenticated dashboard redirects to login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})

test('member can log in and reach the dashboard', async ({ page }) => {
  await logIn(page, 'member@test.local')
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText("Max's season")
  await expect(page.getByRole('heading', { name: "This week's quests" })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Around you' })).toBeVisible()
})

test('a member profile shows the card, collection, and weeks solved', async ({
  page,
}) => {
  await page.goto('/members/u_member', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Max Member')
  await expect(page.getByRole('heading', { name: 'The collection' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Weeks solved' })).toBeVisible()
  await page.getByRole('button', { name: 'Flip the card' }).click()
  await expect(page.getByRole('button', { name: 'Show the front' })).toBeVisible()
})

test('an unknown member id is a 404', async ({ page }) => {
  const res = await page.goto('/members/nobody-here')
  expect(res?.status()).toBe(404)
})

test('member is kept out of admin', async ({ page }) => {
  await logIn(page, 'member@test.local')
  await expect(page).toHaveURL(/\/dashboard/)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/dashboard/)
})

test('officer reaches admin', async ({ page }) => {
  await logIn(page, 'officer@test.local')
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

test('guest sees the membership application on /join', async ({ page }) => {
  await logIn(page, 'guest@test.local')
  await page.goto('/join')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /Four quick questions|Application received/,
  )
})

test('signed-out /join shows the steps and the sign-up link', async ({ page }) => {
  await page.goto('/join')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Join the club' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Three steps, about two minutes' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Create an account' }).first(),
  ).toBeVisible()
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
  await expect(async () => {
    await page.getByRole('button', { name: 'Switch to dark theme' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 500 })
  }).toPass({ timeout: 15_000 })
})

test('admin overview shows pending queues', async ({ page }) => {
  await logIn(page, 'admin@test.local')
  await page.goto('/admin')
  await expect(
    page.getByRole('link', { name: /Showcase entries to approve/ }),
  ).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Admin pages' })).toBeAttached()
})

const PUBLIC_PAGES = [
  '/challenges',
  '/leaderboard',
  '/events',
  '/projects',
  '/blog',
  '/resources',
  '/contact',
  '/privacy',
  '/terms',
  '/join',
]

for (const path of PUBLIC_PAGES) {
  test(`${path} renders without errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    // Some pages draw their visible title with an animation and keep the real
    // h1 for screen readers, so check it exists rather than that it's visible.
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeAttached()
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })
}

test('an unknown page shows the 404 with a guess', async ({ page }) => {
  const res = await page.goto('/chalenges/week-9')
  expect(res?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { name: 'We lost the signal on this one.' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Challenges' }).first()).toHaveAttribute(
    'href',
    '/challenges',
  )
})

test('a missing blog post shows the 404', async ({ page }) => {
  await page.goto('/blog/no-such-post-anywhere')
  await expect(
    page.getByRole('heading', { name: 'We lost the signal on this one.' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Blog', exact: true }).first(),
  ).toBeVisible()
})

test('privacy switches between the full text and the short version', async ({ page }) => {
  await page.goto('/privacy', { waitUntil: 'networkidle' })
  await expect(page.getByText('We use two cookies', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'In short', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'In short', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('We use two cookies', { exact: false })).toBeHidden()
  await expect(page.getByText(/Showing the short version/)).toBeVisible()
})

test('guest is asked to apply before submitting a challenge', async ({ page }) => {
  await logIn(page, 'guest@test.local')
  await expect(page).toHaveURL(/\/dashboard/)
  await page.goto('/challenges/c_seed_1')
  await expect(page.getByRole('link', { name: /apply/i }).first()).toBeVisible()
})

test('an admin backs up, sees the estimate, and downloads the file', async ({ page }) => {
  await logIn(page, 'admin@test.local')
  await page.goto('/admin/backups', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Backups', level: 1 })).toBeVisible()

  await page.getByRole('button', { name: 'Back up now' }).click()
  await expect(page.getByText('Backup finished.')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(/Based on the latest backup/)).toBeVisible()

  // The estimate follows the form before anything is saved.
  const copies = page
    .getByText('Backups kept at once')
    .locator('..')
    .getByRole('definition')
  await page.getByLabel('Delete after (days)').fill('70')
  await expect(copies).toHaveText('11')
  await page.getByLabel('Delete after (days)').fill('3')
  await expect(page.getByText('Enter a whole number from 7 to 365.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save settings' })).toBeDisabled()
  await page.getByLabel('Delete after (days)').fill('90')
  await expect(copies).toHaveText('13')

  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download' }).first().click()
  const download = await downloading
  expect(download.suggestedFilename()).toMatch(/^rhs-coding-club-.*\.json\.gz$/)
  await download.saveAs('test-results/latest-backup.json.gz')
})

test('officers can not reach backups', async ({ page }) => {
  await logIn(page, 'officer@test.local')
  await page.goto('/admin/backups')
  await expect(page).toHaveURL(/\/admin\/?$/)
})

test('a member saves one setting card on /account', async ({ page }) => {
  await logIn(page, 'member@test.local')
  await page.goto('/account', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible()

  const bioCard = page.getByRole('form', { name: 'Bio' })
  const bio = bioCard.getByLabel('Bio')
  const save = bioCard.getByRole('button', { name: 'Save' })
  const before = await bio.inputValue()
  await expect(save).toBeDisabled()

  // Too long: the error shows under the field and nothing is saved.
  await bio.fill('x'.repeat(300))
  await save.click()
  await expect(bioCard.getByText(/280/).last()).toBeVisible()
  await expect(bio).toHaveAttribute('aria-invalid', 'true')

  const next = `Saved from e2e ${Date.now()}`
  await bio.fill(next)
  await save.click()
  await expect(bioCard.getByText('Saved')).toBeVisible()
  await expect(save).toBeDisabled()

  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.getByRole('form', { name: 'Bio' }).getByLabel('Bio')).toHaveValue(
    next,
  )

  // Put the seed bio back.
  await page.getByRole('form', { name: 'Bio' }).getByLabel('Bio').fill(before)
  await page
    .getByRole('form', { name: 'Bio' })
    .getByRole('button', { name: 'Save' })
    .click()
  await expect(page.getByRole('form', { name: 'Bio' }).getByText('Saved')).toBeVisible()
})

test('the contact form flags missing fields, then sends', async ({ page }) => {
  await page.goto('/contact', { waitUntil: 'networkidle' })
  const form = page.getByRole('form', { name: 'Message the officers' })
  await form.getByRole('button', { name: 'Send message' }).click()
  await expect(form.getByText('Tell us your name.')).toBeVisible()
  await expect(form.getByLabel('Your name')).toBeFocused()

  // A topic fills the subject and shows the shortcut for it.
  await form.getByText('Joining', { exact: true }).click()
  await expect(form.getByLabel('Subject')).toHaveValue('Joining the club')
  await expect(form.getByRole('link', { name: 'Start your application' })).toBeVisible()

  const email = `e2e-${Date.now()}@example.com`
  await form.getByLabel('Your name').fill('E2E Parent')
  await form.getByLabel('Email').fill(email)
  await form.getByLabel('Message').fill('Can freshmen join partway through the semester?')
  await form.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('heading', { name: 'Message sent' })).toBeVisible()
  await expect(page.getByText(email)).toBeVisible()
})
