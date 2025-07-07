import type { Connection, Waypoint } from '@zodiac/schema'
import { createMockEnabledConnection } from './createMockEnabledConnection'
import {
  createMockSafeAccount,
  type CreateMockSafeAccountOptions,
} from './createMockSafeAccount'

type CreateMockEndWaypointOptions = {
  account?: CreateMockSafeAccountOptions
  connection?: Connection
}

export const createMockEndWaypoint = ({
  account,
  connection = createMockEnabledConnection(),
}: CreateMockEndWaypointOptions = {}): Waypoint => ({
  account: createMockSafeAccount(account),
  connection,
})
