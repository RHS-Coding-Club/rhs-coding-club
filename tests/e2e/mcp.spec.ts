import { execFileSync } from 'node:child_process'
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import type { OAuthClientProvider } from '@modelcontextprotocol/client'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// The whole path with the official MCP client: sign in through the real /login
// and /consent pages, call tools, and approve a risky one on the real website.
// Metadata documents need a public https URL, so here the client is
// pre-registered in the local database, which the protocol also allows.

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const CLIENT_ID = 'e2e-local-client'
const REDIRECT = 'http://127.0.0.1:3334/callback'
const PASSWORD = 'password123'

test.setTimeout(120_000)

test.beforeAll(() => {
  const now = Date.now()
  const uris = JSON.stringify([REDIRECT])
  const sql = `DELETE FROM oauth_consent WHERE client_id = '${CLIENT_ID}';
    INSERT OR IGNORE INTO oauth_client
    (id, client_id, name, redirect_uris, token_endpoint_auth_method, grant_types, response_types, require_pkce, scopes, created_at, updated_at)
    VALUES ('${CLIENT_ID}', '${CLIENT_ID}', 'E2E Client', '${uris}', 'none',
      '["authorization_code","refresh_token"]', '["code"]', 1,
      '["club:manage","offline_access"]', ${now}, ${now});
    INSERT OR IGNORE INTO oauth_resource (id, identifier, name, created_at, updated_at)
      VALUES ('e2e-resource', '${BASE}/mcp', '${BASE}/mcp', ${now}, ${now});
    INSERT OR IGNORE INTO oauth_client_resource (id, client_id, resource_id, created_at)
      VALUES ('e2e-link', '${CLIENT_ID}', '${BASE}/mcp', ${now});`
  execFileSync(
    'bunx',
    ['wrangler', 'd1', 'execute', 'rhs-coding-club', '--local', '--command', sql],
    { stdio: 'pipe' },
  )
})

class TestProvider implements OAuthClientProvider {
  redirectTarget: URL | null = null
  private verifier = ''
  private saved: Parameters<OAuthClientProvider['saveTokens']>[0] | undefined

  get redirectUrl() {
    return REDIRECT
  }
  get clientMetadata() {
    return {
      client_name: 'E2E Client',
      redirect_uris: [REDIRECT],
      token_endpoint_auth_method: 'none',
    }
  }
  clientInformation() {
    return { client_id: CLIENT_ID }
  }
  tokens() {
    return this.saved
  }
  saveTokens(tokens: Parameters<OAuthClientProvider['saveTokens']>[0]) {
    this.saved = tokens
  }
  redirectToAuthorization(url: URL) {
    this.redirectTarget = url
  }
  saveCodeVerifier(verifier: string) {
    this.verifier = verifier
  }
  codeVerifier() {
    return this.verifier
  }
}

const PROTOCOL = '2026-07-28'
const newClient = () =>
  new Client(
    { name: 'e2e', version: '1.0.0' },
    { versionNegotiation: { mode: { pin: PROTOCOL } } },
  )
const newTransport = (authProvider: OAuthClientProvider) =>
  new StreamableHTTPClientTransport(new URL(`${BASE}/mcp`), { authProvider })

/** Starts the client's sign-in, and returns where it wants the browser to go. */
async function beginSignIn(provider: TestProvider) {
  await newClient()
    .connect(newTransport(provider))
    .catch(() => undefined)
  if (!provider.redirectTarget) throw new Error('The client did not start signing in')
  return provider.redirectTarget
}

async function logInHere(page: Page, email: string) {
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Log in' }).click()
}

/** Holds the redirect back to the app, which isn't listening, and returns the code. */
async function captureCode(page: Page) {
  let resolve: (back: URL) => void = () => undefined
  const redirected = new Promise<URL>((r) => (resolve = r))
  await page.route(`${REDIRECT}**`, (route) => {
    resolve(new URL(route.request().url()))
    void route.fulfill({ status: 200, body: 'done' })
  })
  return { redirected }
}

async function connectAs(page: Page, email: string) {
  const provider = new TestProvider()
  const target = await beginSignIn(provider)
  const { redirected } = await captureCode(page)
  await page.goto(target.toString())
  await expect(page).toHaveURL(/\/login\?/)
  await logInHere(page, email)
  await expect(page).toHaveURL(/\/consent\?/)
  await expect(page.getByRole('heading', { name: /Connect E2E Client/ })).toBeVisible()
  await expect(page.getByText('127.0.0.1:3334')).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Connect', exact: true }).click()

  const back = await redirected
  expect(back.searchParams.get('error')).toBeNull()
  // RFC 9207: says who issued the code, so a client can't be tricked across servers.
  expect(back.searchParams.get('iss')).toBe(`${BASE}/api/auth`)
  await newTransport(provider).finishAuth(back.searchParams)
  const client = newClient()
  await client.connect(newTransport(provider))
  return { client, provider }
}

function textOf(result: Awaited<ReturnType<Client['callTool']>>) {
  const content = result.content as { type: string; text: string }[]
  return content.at(-1)?.text ?? ''
}

test('an officer connects, works, and approves a delete on the website', async ({
  page,
}) => {
  const { client } = await connectAs(page, 'officer@test.local')
  // The tab is stuck on the app's callback, so carry on in a new one.
  const site = await page.context().newPage()

  const { tools } = await client.listTools()
  const names = tools.map((t) => t.name)
  expect(names).toContain('save_event')
  expect(names).not.toContain('set_user_role')
  expect(names).not.toContain('reset_data')

  const title = `E2E event ${Date.now()}`
  const saved = await client.callTool({
    name: 'save_event',
    arguments: {
      values: {
        title,
        description: 'Made in an end-to-end test.',
        startsAt: '2031-02-01T15:30',
        endsAt: '2031-02-01T16:30',
        location: 'Room 1',
        tags: [],
        coverKey: null,
      },
    },
  })
  expect(saved.isError).toBeFalsy()
  const eventId = (JSON.parse(textOf(saved)) as { id: string }).id

  // It's on the real site.
  await site.goto('/admin/events')
  await expect(site.getByText(title)).toBeVisible()

  const asked = await client.callTool({
    name: 'delete_event',
    arguments: { eventId },
  })
  const body = JSON.parse(textOf(asked)) as { status: string; approveUrl: string }
  expect(body.status).toBe('awaiting_approval')

  await site.goto('/admin/events')
  await expect(site.getByText(title)).toBeVisible()

  await site.goto(body.approveUrl)
  await expect(site.getByText(`"${title}"`)).toBeVisible()
  await site.waitForLoadState('networkidle')
  await site.getByRole('button', { name: 'Approve' }).click()
  await expect(site.getByText('You approved this, and it ran.')).toBeVisible()

  await site.goto('/admin/events')
  await expect(site.getByText(title)).toHaveCount(0)

  // The activity page shows it and the app can be cut off from there.
  const pageErrors: string[] = []
  site.on('pageerror', (err) => pageErrors.push(err.message))
  await site.goto('/admin/mcp')
  await expect(site.getByText('E2E Client')).toBeVisible()
  await expect(site.getByText('Approved and done').first()).toBeVisible()
  await site.waitForLoadState('networkidle')
  await site.getByRole('button', { name: 'Disconnect' }).click()
  await expect(site.getByText('Nothing connected.')).toBeVisible()
  expect(pageErrors).toEqual([])
  await client.close()
})

test('an admin gets the admin tools, and a legacy client is refused', async ({
  page,
}) => {
  const { client, provider } = await connectAs(page, 'admin@test.local')
  const { tools } = await client.listTools()
  expect(tools.map((t) => t.name)).toContain('set_user_role')
  await client.close()

  // Same valid token, but opening with the 2025 handshake.
  const legacy = new Client(
    { name: 'legacy', version: '1.0.0' },
    { versionNegotiation: { mode: 'legacy' } },
  )
  await expect(legacy.connect(newTransport(provider))).rejects.toThrow(
    /Unsupported protocol version/,
  )
})

test('a member is told officers only, and can not get a token', async ({ page }) => {
  const provider = new TestProvider()
  const target = await beginSignIn(provider)
  await page.goto(target.toString())
  await logInHere(page, 'member@test.local')
  await expect(page).toHaveURL(/\/consent\?/)
  await expect(page.getByRole('heading', { name: 'Officers only' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toHaveCount(0)
})

test('anyone without a token is sent to sign in', async ({ request }) => {
  const res = await request.post(`${BASE}/mcp`, {
    headers: { accept: 'application/json, text/event-stream' },
    data: {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'old', version: '1' },
      },
    },
  })
  expect(res.status()).toBe(401)
  expect(res.headers()['www-authenticate']).toContain('resource_metadata')
})
