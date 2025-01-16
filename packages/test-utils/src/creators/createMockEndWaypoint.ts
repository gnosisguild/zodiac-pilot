import type { Connection, Waypoint } from '@zodiac/schema'
import { createMockEnabledConnection } from './createMockEnabledConnection'
import { createMockSafeAccount, type Safe } from './createMockSafeAccount'

type CreateMockEndWaypointOptions = {
  account?: Partial<Safe>
  connection?: Connection
}

export const createMockEndWaypoint = ({
  account,
  connection = createMockEnabledConnection(),
}: CreateMockEndWaypointOptions = {}): Waypoint => ({
  account: createMockSafeAccount(account),
  connection,
})
