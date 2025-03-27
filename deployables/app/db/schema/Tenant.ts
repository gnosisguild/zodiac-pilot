import { date, pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const Tenant = pgTable('Tenant', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  createdAt: date().notNull().defaultNow(),
})

export type InsertTenant = typeof Tenant.$inferInsert
export type SelectTenant = typeof Tenant.$inferSelect
