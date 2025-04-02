import { relations } from 'drizzle-orm'
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

const createdTimestamp = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}

export const TenantTable = pgTable('Tenant', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  ...createdTimestamp,
})

export type Tenant = typeof TenantTable.$inferSelect

export const TenantRelations = relations(TenantTable, ({ many }) => ({
  activeFeatures: many(ActiveFeatureTable),
}))

export const UserTable = pgTable(
  'User',
  {
    id: uuid().notNull().defaultRandom().primaryKey(),
    tenantId: uuid()
      .notNull()
      .references(() => TenantTable.id, { onDelete: 'cascade' }),
    ...createdTimestamp,
  },
  (table) => [index().on(table.tenantId)],
)

export const FeatureTable = pgTable(
  'Feature',
  {
    id: uuid().notNull().defaultRandom().primaryKey(),
    name: text().notNull(),
    ...createdTimestamp,
  },
  (table) => [unique().on(table.name)],
)

export const FeatureRelations = relations(FeatureTable, ({ many }) => ({
  activeOnTenants: many(ActiveFeatureTable),
}))

export const ActiveFeatureTable = pgTable(
  'ActiveFeature',
  {
    featureId: uuid()
      .notNull()
      .references(() => FeatureTable.id, { onDelete: 'cascade' }),
    tenantId: uuid()
      .notNull()
      .references(() => TenantTable.id, { onDelete: 'cascade' }),
    ...createdTimestamp,
  },
  (table) => [
    primaryKey({ columns: [table.featureId, table.tenantId] }),
    unique().on(table.featureId, table.tenantId),
    index().on(table.featureId),
    index().on(table.tenantId),
  ],
)

export const ActiveFeatureRelations = relations(
  ActiveFeatureTable,
  ({ one }) => ({
    tenant: one(TenantTable, {
      fields: [ActiveFeatureTable.tenantId],
      references: [TenantTable.id],
    }),
    feature: one(FeatureTable, {
      fields: [ActiveFeatureTable.featureId],
      references: [FeatureTable.id],
    }),
  }),
)

export const schema = {
  tenant: TenantTable,
  user: UserTable,
  feature: FeatureTable,
  activeFeature: ActiveFeatureTable,

  TenantRelations,
  FeatureRelations,
  ActiveFeatureRelations,
}
