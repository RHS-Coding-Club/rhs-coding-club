import { env } from 'cloudflare:workers'

/** The one scope MCP apps ask for. What a user can do comes from their role. */
export const MCP_SCOPE = 'club:manage'

/** The MCP endpoint's URL, which access tokens are bound to. */
export function mcpResource() {
  return `${env.APP_URL}/mcp`
}
