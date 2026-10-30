import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'
import * as schema from './schema'

export type Db = ReturnType<typeof createDb>

function createDb(binding: D1Database) {
  return drizzle(binding, { schema })
}

let cached: Db | undefined

/** Drizzle client over the D1 binding. Only import from server code. */
export function getDb(): Db {
  cached ??= createDb(env.DB)
  return cached
}

export { schema }
