import type { ExecutionRoute, Waypoint } from '@zodiac/schema'

type GetWaypointsOptions = {
  includeEnd?: boolean
}

export const getWaypoints = (
  route: ExecutionRoute,
  { includeEnd = true }: GetWaypointsOptions = {},
): Waypoint[] => {
  if (route.waypoints == null) {
    return []
  }

  const [, ...waypoints] = route.waypoints

  if (includeEnd === false) {
    return waypoints.slice(0, waypoints.length - 1)
  }

  return waypoints
}
