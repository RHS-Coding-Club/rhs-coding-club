import { integer, text } from 'drizzle-orm/sqlite-core'

export const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())

export const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())

export const updatedAt = () =>
  integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())

export const timestamps = {
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}

export const jsonStringArray = (name: string) =>
  text(name, { mode: 'json' }).$type<string[]>().default([]).notNull()
