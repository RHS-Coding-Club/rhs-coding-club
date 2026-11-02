// Stub Worker entry for the Vitest Workers pool. Integration tests call server
// modules directly; nothing routes through fetch.
export default {
  fetch: () => new Response('test worker', { status: 200 }),
} satisfies ExportedHandler<Cloudflare.Env>
