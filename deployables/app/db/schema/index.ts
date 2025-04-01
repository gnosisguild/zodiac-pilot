import { date, index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'

export const TenantTable = pgTable('Tenant', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  createdAt: date().notNull().defaultNow(),
})

export type Tenant = typeof TenantTable.$inferSelect

export const UserTable = pgTable(
  'User',
  {
    id: uuid().notNull().defaultRandom().primaryKey(),
    tenantId: uuid()
      .notNull()
      .references(() => TenantTable.id, { onDelete: 'cascade' }),
    createdAt: date().notNull().defaultNow(),
  },
  (table) => [index().on(table.tenantId)],
)

export const FeatureTable = pgTable('Feature', {
  id: uuid().notNull().defaultRandom().primaryKey(),
  createdAt: date().notNull().defaultNow(),
  name: text().notNull(),
})

export const ActiveFeatureTable = pgTable(
  'ActiveFeature',
  {
    featureId: uuid()
      .notNull()
      .references(() => FeatureTable.id, { onDelete: 'cascade' }),
    tenantId: uuid()
      .notNull()
      .references(() => TenantTable.id, { onDelete: 'cascade' }),
    createdAt: date().notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.featureId, table.tenantId),
    index().on(table.featureId),
    index().on(table.tenantId),
  ],
)

export const schema = {
  tenant: TenantTable,
  user: UserTable,
  feature: FeatureTable,
  activeFeature: ActiveFeatureTable,
}
