import type { Connection, Waypoint } from '@zodiac/schema'
import { createMockEnabledConnection } from './createMockEnabledConnection'
import {
  createMockSafeExecutionAccount,
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
  account: createMockSafeExecutionAccount(account),
  connection,
})
