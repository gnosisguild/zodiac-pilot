import type { ChainId } from '@zodiac/chains'
import {
  addressSchema,
  chainIdSchema,
  type HexAddress,
  type MetaTransactionRequest,
  type Waypoints,
} from '@zodiac/schema'
import type { UUID } from 'crypto'
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
  deletedById: uuid()
    .$type<UUID>()
    .references(() => UserTable.id, { onDelete: 'set null' }),
  deletedAt: timestamp({ withTimezone: true }),
}

export const TenantTable = pgTable(
  'Tenant',
  {
    id: uuid().notNull().$type<UUID>().defaultRandom().primaryKey(),
    name: text().notNull(),
    externalId: text(),

    ...createdTimestamp,
  },
  (table) => [index().on(table.externalId)],
)

const tenantReference = {
  tenantId: uuid()
    .notNull()
    .$type<UUID>()
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
    id: uuid().notNull().$type<UUID>().defaultRandom().primaryKey(),
    fullName: text().notNull().default(''),
    externalId: text(),
    ...createdTimestamp,
  },
  (table) => [index().on(table.externalId)],
)

const userReference = {
  userId: uuid()
    .notNull()
    .$type<UUID>()
    .references(() => UserTable.id, { onDelete: 'cascade' }),
}

export type User = typeof UserTable.$inferSelect
export type UserCreateInput = typeof UserTable.$inferInsert

export const TenantMembershipTable = pgTable(
  'TenantMembership',
  {
    ...tenantReference,
    ...userReference,
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
    id: uuid().notNull().$type<UUID>().defaultRandom().primaryKey(),
    name: text().notNull(),
    ...createdTimestamp,
  },
  (table) => [unique().on(table.name)],
)

export type Feature = typeof FeatureTable.$inferSelect
export type FeatureCreateInput = typeof FeatureTable.$inferInsert

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
      .$type<UUID>()
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

export const SubscriptionPlanTable = pgTable(
  'SubscriptionPlan',
  {
    id: uuid().notNull().$type<UUID>().defaultRandom().primaryKey(),

    name: text().notNull(),
    isDefault: boolean().notNull().default(false),

    ...createdTimestamp,
    ...deletable,
  },
  (table) => [index().on(table.deletedById)],
)

export type SubscriptionPlan = typeof SubscriptionPlanTable.$inferSelect
export type SubscriptionPlanCreateInput =
  typeof SubscriptionPlanTable.$inferInsert

export const ActiveSubscriptionTable = pgTable(
  'ActiveSubscription',
  {
    subscriptionPlanId: uuid()
      .notNull()
      .$type<UUID>()
      .references(() => SubscriptionPlanTable.id, { onDelete: 'cascade' }),

    validFrom: timestamp({ withTimezone: true }).notNull().defaultNow(),
    validThrough: timestamp({ withTimezone: true }),

    ...tenantReference,
    ...createdTimestamp,
  },
  (table) => [index().on(table.subscriptionPlanId), index().on(table.tenantId)],
)

const ActiveSubscriptionRelations = relations(
  ActiveSubscriptionTable,
  ({ one }) => ({
    subscriptionPlan: one(SubscriptionPlanTable, {
      fields: [ActiveSubscriptionTable.subscriptionPlanId],
      references: [SubscriptionPlanTable.id],
    }),
  }),
)

export const AccountTable = pgTable(
  'Account',
  {
    id: uuid().notNull().$type<UUID>().defaultRandom().primaryKey(),
    createdById: uuid()
      .notNull()
      .$type<UUID>()
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

const accountReference = {
  accountId: uuid()
    .notNull()
    .$type<UUID>()
    .references(() => AccountTable.id, { onDelete: 'cascade' }),
}

export type Account = typeof AccountTable.$inferSelect
export type AccountCreateInput = typeof AccountTable.$inferInsert

export const accountSchema = createSelectSchema(AccountTable, {
  chainId: chainIdSchema,
  address: addressSchema,
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().optional().nullable(),
})

const AccountRelations = relations(AccountTable, ({ many }) => ({
  activeRoutes: many(ActiveRouteTable),
}))

export const WalletTable = pgTable(
  'Wallet',
  {
    id: uuid().notNull().$type<UUID>().defaultRandom().primaryKey(),
    belongsToId: uuid()
      .notNull()
      .$type<UUID>()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    label: text().notNull(),
    address: text().$type<HexAddress>().notNull(),

    ...createdTimestamp,
    ...deletable,
  },
  (table) => [index().on(table.belongsToId)],
)

const walletReference = {
  walletId: uuid()
    .notNull()
    .$type<UUID>()
    .references(() => WalletTable.id, { onDelete: 'cascade' }),
}

export type Wallet = typeof WalletTable.$inferSelect
export type WalletCreateInput = typeof WalletTable.$inferInsert

export const RouteTable = pgTable(
  'Route',
  {
    id: uuid().notNull().$type<UUID>().defaultRandom().primaryKey(),
    fromId: uuid()
      .notNull()
      .$type<UUID>()
      .references(() => WalletTable.id, { onDelete: 'set null' }),
    toId: uuid()
      .notNull()
      .$type<UUID>()
      .references(() => AccountTable.id, { onDelete: 'cascade' }),
    waypoints: json().$type<Waypoints>().notNull(),

    ...tenantReference,
    ...createdTimestamp,
  },
  (table) => [
    index().on(table.fromId),
    index().on(table.toId),
    index().on(table.tenantId),
  ],
)

const routeReference = {
  routeId: uuid()
    .notNull()
    .$type<UUID>()
    .references(() => RouteTable.id, { onDelete: 'cascade' }),
}

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
    ...userReference,
    ...accountReference,
    ...routeReference,
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
    ...userReference,
    ...accountReference,
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

export const SignedTransactionTable = pgTable(
  'SignedTransaction',
  {
    id: uuid().notNull().$type<UUID>().defaultRandom().primaryKey(),

    transaction: json().$type<MetaTransactionRequest[]>().notNull(),
    explorerUrl: text(),
    safeWalletUrl: text(),

    ...walletReference,
    ...accountReference,
    ...userReference,
    ...routeReference,
    ...tenantReference,
    ...createdTimestamp,
  },
  (table) => [
    index().on(table.accountId),
    index().on(table.routeId),
    index().on(table.tenantId),
    index().on(table.userId),
    index().on(table.walletId),
  ],
)

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
  signedTransaction: SignedTransactionTable,
  subscriptionPlans: SubscriptionPlanTable,
  activeSubscriptionPlans: ActiveSubscriptionTable,

  TenantRelations,
  FeatureRelations,
  RouteRelations,
  AccountRelations,
  ActiveFeatureRelations,
  ActiveRouteRelations,
  ActiveAccountRelations,
  ActiveSubscriptionRelations,
}
