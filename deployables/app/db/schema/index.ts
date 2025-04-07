import type { HexAddress } from '@zodiac/schema'
import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  json,
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

const deletable = {
  deleted: boolean().default(false).notNull(),
  deletedById: uuid().references(() => UserTable.id, { onDelete: 'set null' }),
  deletedAt: timestamp({ withTimezone: true }),
}

export const TenantTable = pgTable('Tenant', {
  id: uuid().notNull().defaultRandom().primaryKey(),
  name: text().notNull(),
  ...createdTimestamp,
})

const tenantReference = {
  tenantId: uuid()
    .notNull()
    .references(() => TenantTable.id, { onDelete: 'cascade' }),
}

export type Tenant = typeof TenantTable.$inferSelect
export type TenantCreateInput = typeof TenantTable.$inferInsert

export const TenantRelations = relations(TenantTable, ({ many }) => ({
  activeFeatures: many(ActiveFeatureTable),
}))

export const UserTable = pgTable(
  'User',
  {
    id: uuid().notNull().defaultRandom().primaryKey(),
    ...tenantReference,
    ...createdTimestamp,
  },
  (table) => [index().on(table.tenantId)],
)

export type User = typeof UserTable.$inferSelect
export type UserCreateInput = typeof UserTable.$inferInsert

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
    ...tenantReference,
    ...createdTimestamp,
  },
  (table) => [
    primaryKey({ columns: [table.featureId, table.tenantId] }),
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

export const AccountTable = pgTable(
  'Account',
  {
    id: uuid().notNull().defaultRandom().primaryKey(),
    createdById: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    label: text(),
    chainId: integer().notNull(),
    address: text().notNull(),

    ...tenantReference,
    ...createdTimestamp,
  },
  (table) => [
    index().on(table.tenantId),
    index().on(table.createdById),
    unique().on(table.tenantId, table.chainId, table.address),
  ],
)

export type Account = typeof AccountTable.$inferSelect
export type AccountCreateInput = typeof AccountTable.$inferInsert

export const WalletTable = pgTable(
  'Wallet',
  {
    id: uuid().notNull().defaultRandom().primaryKey(),
    belongsToId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    label: text().notNull(),
    address: text().$type<HexAddress>().notNull(),

    ...tenantReference,
    ...createdTimestamp,
    ...deletable,
  },
  (table) => [index().on(table.tenantId), index().on(table.belongsToId)],
)

export type Wallet = typeof WalletTable.$inferSelect
export type WalletCreateInput = typeof WalletTable.$inferInsert

export const RouteTable = pgTable(
  'Route',
  {
    id: uuid().notNull().defaultRandom().primaryKey(),
    fromId: uuid().references(() => WalletTable.id, { onDelete: 'set null' }),
    toId: uuid()
      .notNull()
      .references(() => AccountTable.id, { onDelete: 'cascade' }),
    waypoints: json(),

    ...tenantReference,
    ...createdTimestamp,
  },
  (table) => [
    index().on(table.fromId),
    index().on(table.toId),
    index().on(table.tenantId),
  ],
)

export const ActiveRouteTable = pgTable(
  'ActiveRoute',
  {
    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    accountId: uuid()
      .notNull()
      .references(() => AccountTable.id, { onDelete: 'cascade' }),
    routeId: uuid()
      .notNull()
      .references(() => RouteTable.id, { onDelete: 'cascade' }),

    ...tenantReference,
    ...createdTimestamp,
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.accountId, table.routeId] }),
    index().on(table.userId),
    index().on(table.accountId),
    index().on(table.routeId),
    index().on(table.tenantId),
  ],
)

export const schema = {
  tenant: TenantTable,
  user: UserTable,
  feature: FeatureTable,
  activeFeature: ActiveFeatureTable,
  account: AccountTable,
  wallet: WalletTable,
  route: RouteTable,
  activeRoute: ActiveRouteTable,

  TenantRelations,
  FeatureRelations,
  ActiveFeatureRelations,
}
