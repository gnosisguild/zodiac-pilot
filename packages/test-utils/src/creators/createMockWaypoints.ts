import type { StartingWaypoint, Waypoint, Waypoints } from '@zodiac/schema'
import { createMockEndWaypoint } from './createMockEndWaypoint'
import { createMockStartingWaypoint } from './createMockStartingWaypoint'

type CreateMockWaypointsOptions = {
  waypoints?: Waypoint[]
  start?: StartingWaypoint
  end?: Waypoint | true
}

export const createMockWaypoints = ({
  start = createMockStartingWaypoint(),
  waypoints = [],
  end,
}: CreateMockWaypointsOptions = {}): Waypoints =>
  end == null
    ? [start, ...waypoints]
    : end === true
      ? [start, ...waypoints, createMockEndWaypoint()]
      : [start, ...waypoints, end]
