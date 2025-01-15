import type { ExecutionRoute, Waypoint } from '@zodiac/schema'

export const getWaypoints = (route: ExecutionRoute): Waypoint[] => {
  if (route.waypoints == null) {
    return []
  }

  const [, ...waypoints] = route.waypoints

  return waypoints
}
