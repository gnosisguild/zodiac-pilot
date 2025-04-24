import {
  RouteTable,
  type Account,
  type Route,
  type RouteCreateInput,
  type Wallet,
} from '@zodiac/db/schema'
import {
  createMockEndWaypoint,
  createMockEoaAccount,
  createMockOwnsConnection,
  createMockSafeAccount,
  createMockStartingWaypoint,
  createMockWaypoints,
} from '@zodiac/test-utils'
import { randomUUID } from 'crypto'
import { prefixAddress } from 'ser-kit'
import { createFactory } from './createFactory'

export const routeFactory = createFactory<
  RouteCreateInput,
  Route,
  [account: Account, wallet: Wallet]
>({
  build(
    account,
    wallet,
    {
      waypoints = createMockWaypoints({
        start: createMockStartingWaypoint(
          createMockEoaAccount({ address: wallet.address }),
        ),
        end: createMockEndWaypoint({
          account: createMockSafeAccount({
            chainId: account.chainId,
            address: account.address,
          }),
          connection: createMockOwnsConnection(
            prefixAddress(undefined, wallet.address),
          ),
        }),
      }),
      ...route
    } = {},
  ) {
    return {
      tenantId: account.tenantId,
      toId: account.id,
      fromId: wallet.id,
      waypoints,

      ...route,
    }
  },
  async create(db, data) {
    const [route] = await db.insert(RouteTable).values(data).returning()

    return route
  },
  createWithoutDb(data) {
    return Object.assign(
      { id: randomUUID(), createdAt: new Date(), waypoints: null },
      data,
    )
  },
})
