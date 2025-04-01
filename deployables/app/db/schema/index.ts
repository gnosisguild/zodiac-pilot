import { relations } from 'drizzle-orm'
import {
  date,
  index,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

export const TenantTable = pgTable('Tenant', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  createdAt: date().notNull().defaultNow(),
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
    createdAt: date().notNull().defaultNow(),
  },
  (table) => [index().on(table.tenantId)],
)

export const FeatureTable = pgTable('Feature', {
  id: uuid().notNull().defaultRandom().primaryKey(),
  createdAt: date().notNull().defaultNow(),
  name: text().notNull(),
})

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
    createdAt: date().notNull().defaultNow(),
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
