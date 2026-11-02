import { createMcpProtectedRequestHandler } from '@better-auth/mcp'
import { Server, createMcpHandler } from '@modelcontextprotocol/server'
import { createDpopReplayStore } from 'better-auth/oauth2'
import { env } from 'cloudflare:workers'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '#/db'
import { getAuth } from '#/lib/auth'
import { MCP_SCOPE, mcpResource } from '#/lib/mcp-config'
import { isRateLimited } from '#/lib/rate-limit'
import { hasRole, isRole } from '#/lib/roles'
import { callTool, listToolsFor } from './execute'
import type { McpUser } from './types'

// The MCP endpoint and the discovery documents clients read before signing in.
// Served ahead of the site's router from src/server.ts, and imported lazily so
// ordinary page views never load the tool schemas.

const DISCOVERY =
  /^\/\.well-known\/(oauth-protected-resource|oauth-authorization-server|openid-configuration)(\/|$)/

interface RequestAuth {
  user: McpUser
  clientId: string | null
}

const rpcError = (status: number, message: string, headers?: HeadersInit) =>
  Response.json(
    { jsonrpc: '2.0', error: { code: -32000, message }, id: null },
    { status, headers },
  )

function createServer(auth: RequestAuth) {
  const server = new Server(
    { name: 'rhs-coding-club', title: 'RHS Coding Club', version: '1.0.0' },
    {
      capabilities: { tools: {} },
      instructions:
        "Manage the RHS Coding Club website as the signed-in officer or admin. Risky tools return an approval link instead of acting: show it to the person and don't report the action as done until they say they approved it.",
    },
  )
  server.setRequestHandler('tools/list', () => ({
    tools: listToolsFor(auth.user),
    // Depends on the caller's role, so shared caches must not reuse it.
    ttlMs: 5 * 60_000,
    cacheScope: 'private' as const,
  }))
  server.setRequestHandler('tools/call', async (request) => {
    const result = await callTool(
      { db: getDb(), ...auth },
      request.params.name,
      request.params.arguments,
    )
    return {
      isError: result.isError,
      content: result.text.map((text) => ({ type: 'text' as const, text })),
    }
  })
  return server
}

const mcpHandler = createMcpHandler(
  (ctx) => createServer(ctx.authInfo?.extra as unknown as RequestAuth),
  // Only clients on the 2026-07-28 protocol. Older ones get an
  // unsupported-version error naming that revision.
  { legacy: 'reject' },
)

let cachedJwks: { keys: unknown[]; at: number } | undefined
const JWKS_TTL_MS = 5 * 60_000

/** The signing keys, read in-process: a Worker can't fetch its own workers.dev URL. */
async function localJwks() {
  if (!cachedJwks || Date.now() - cachedJwks.at > JWKS_TTL_MS) {
    const { keys } = await getAuth().api.getJwks()
    cachedJwks = { keys, at: Date.now() }
  }
  return { keys: cachedJwks.keys }
}

async function serve(request: Request, claims: Record<string, unknown>) {
  const userId = typeof claims.sub === 'string' ? claims.sub : ''
  const row = await getDb().query.user.findFirst({
    where: eq(schema.user.id, userId),
    columns: { id: true, name: true, email: true, role: true },
  })
  // The token says who, the database says what they may do right now, so a
  // demotion applies on the next request rather than when the token expires.
  const role = isRole(row?.role) ? row.role : null
  if (!row || !role || !hasRole(role, 'officer'))
    return rpcError(403, 'Only officers and admins can use this server.')

  if (await isRateLimited(env.MCP_LIMIT, row.id))
    return rpcError(429, 'Too many requests. Try again in a minute.', {
      'retry-after': '60',
    })

  const auth: RequestAuth = {
    user: { ...row, role },
    clientId: typeof claims.azp === 'string' ? claims.azp : null,
  }
  return mcpHandler.fetch(request, {
    authInfo: {
      token: '',
      clientId: auth.clientId ?? '',
      scopes: [MCP_SCOPE],
      extra: auth as unknown as Record<string, unknown>,
    },
  })
}

async function protectedHandler() {
  const { baseURL, internalAdapter } = await getAuth().$context
  return createMcpProtectedRequestHandler(
    {
      issuer: baseURL,
      audience: mcpResource(),
      jwtVerifyOptions: { requiredClaims: ['azp'] },
      requiredScopes: [MCP_SCOPE],
      // The verifier also accepts a function here. Its type only says string,
      // and a URL would make the Worker fetch itself. tests/integration/mcp.test.ts
      // fails if an upgrade stops honoring this.
      jwksUrl: localJwks as unknown as string,
      dpop: { replayStore: createDpopReplayStore(internalAdapter) },
    },
    serve,
  )
}

/** The response for an MCP or discovery request, or null for anything else. */
export async function handleMcpRequest(request: Request): Promise<Response | null> {
  const { pathname } = new URL(request.url)
  if (DISCOVERY.test(pathname)) return getAuth().handler(request)
  if (pathname !== '/mcp') return null

  if (request.method !== 'POST')
    return new Response(null, { status: 405, headers: { allow: 'POST' } })
  // Browsers send Origin; a page on another site has no business calling this.
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(env.APP_URL).origin)
    return rpcError(403, 'That origin is not allowed.')

  return (await protectedHandler())(request)
}
