import type { ChainId } from '@zodiac/chains'
import {
  addressSchema,
  chainIdSchema,
  type HexAddress,
  type Waypoints,
} from '@zodiac/schema'
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
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

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

export const UserTable = pgTable('User', {
  id: uuid().notNull().defaultRandom().primaryKey(),
  ...createdTimestamp,
})

export type User = typeof UserTable.$inferSelect
export type UserCreateInput = typeof UserTable.$inferInsert

export const TenantMembershipTable = pgTable(
  'TenantMembership',
  {
    tenantId: uuid()
      .notNull()
      .references(() => TenantTable.id, { onDelete: 'cascade' }),
    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),

    ...createdTimestamp,
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.userId] }),
    index().on(table.tenantId),
    index().on(table.userId),
  ],
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

export const featureSchema = createSelectSchema(FeatureTable, {
  createdAt: z.coerce.date(),
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
    chainId: integer().$type<ChainId>().notNull(),
    address: text().$type<HexAddress>().notNull(),

    ...tenantReference,
    ...createdTimestamp,
    ...deletable,
  },
  (table) => [index().on(table.tenantId), index().on(table.createdById)],
)

export type Account = typeof AccountTable.$inferSelect
export type AccountCreateInput = typeof AccountTable.$inferInsert

export const accountSchema = createSelectSchema(AccountTable, {
  chainId: chainIdSchema,
  address: addressSchema,
  createdAt: z.coerce.date(),
})

const AccountRelations = relations(AccountTable, ({ many }) => ({
  activeRoutes: many(ActiveRouteTable),
}))

export const WalletTable = pgTable(
  'Wallet',
  {
    id: uuid().notNull().defaultRandom().primaryKey(),
    belongsToId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    label: text().notNull(),
    address: text().$type<HexAddress>().notNull(),

    ...createdTimestamp,
    ...deletable,
  },
  (table) => [index().on(table.belongsToId)],
)

export type Wallet = typeof WalletTable.$inferSelect
export type WalletCreateInput = typeof WalletTable.$inferInsert

export const RouteTable = pgTable(
  'Route',
  {
    id: uuid().notNull().defaultRandom().primaryKey(),
    fromId: uuid()
      .notNull()
      .references(() => WalletTable.id, { onDelete: 'set null' }),
    toId: uuid()
      .notNull()
      .references(() => AccountTable.id, { onDelete: 'cascade' }),
    waypoints: json().$type<Waypoints>(),

    ...tenantReference,
    ...createdTimestamp,
  },
  (table) => [
    index().on(table.fromId),
    index().on(table.toId),
    index().on(table.tenantId),
  ],
)

export type Route = typeof RouteTable.$inferSelect
export type RouteCreateInput = typeof RouteTable.$inferInsert

const RouteRelations = relations(RouteTable, ({ one }) => ({
  wallet: one(WalletTable, {
    fields: [RouteTable.fromId],
    references: [WalletTable.id],
  }),
  account: one(AccountTable, {
    fields: [RouteTable.toId],
    references: [AccountTable.id],
  }),
}))

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

const ActiveRouteRelations = relations(ActiveRouteTable, ({ one }) => ({
  route: one(RouteTable, {
    fields: [ActiveRouteTable.routeId],
    references: [RouteTable.id],
  }),

  account: one(AccountTable, {
    fields: [ActiveRouteTable.accountId],
    references: [AccountTable.id],
  }),
}))

export const ActiveAccountTable = pgTable(
  'ActiveAccount',
  {
    userId: uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    accountId: uuid()
      .notNull()
      .references(() => AccountTable.id, { onDelete: 'cascade' }),

    ...tenantReference,
    ...createdTimestamp,
  },
  (table) => [
    index().on(table.accountId),
    index().on(table.tenantId),
    index().on(table.userId),
  ],
)

const ActiveAccountRelations = relations(ActiveAccountTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [ActiveAccountTable.userId],
    references: [UserTable.id],
  }),
  account: one(AccountTable, {
    fields: [ActiveAccountTable.accountId],
    references: [AccountTable.id],
  }),
}))

export const schema = {
  tenant: TenantTable,
  user: UserTable,
  tenantMembership: TenantMembershipTable,
  feature: FeatureTable,
  activeFeature: ActiveFeatureTable,
  account: AccountTable,
  wallet: WalletTable,
  route: RouteTable,
  activeRoute: ActiveRouteTable,
  activeAccount: ActiveAccountTable,

  TenantRelations,
  FeatureRelations,
  RouteRelations,
  AccountRelations,
  ActiveFeatureRelations,
  ActiveRouteRelations,
  ActiveAccountRelations,
}
