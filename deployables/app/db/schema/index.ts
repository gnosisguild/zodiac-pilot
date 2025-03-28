import { date, pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const TenantTable = pgTable('Tenant', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  createdAt: date().notNull().defaultNow(),
})

export type Tenant = typeof TenantTable.$inferSelect

export const UserTable = pgTable('User', {
  id: uuid().notNull().defaultRandom().primaryKey(),
  tenantId: uuid()
    .notNull()
    .references(() => TenantTable.id, { onDelete: 'cascade' }),
  createdAt: date().notNull().defaultNow(),
})

export const schema = {
  tenant: TenantTable,
  user: UserTable,
}
