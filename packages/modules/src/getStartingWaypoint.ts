import { invariant } from '@epic-web/invariant'
import type { StartingWaypoint, Waypoints } from '@zodiac/schema'

export const getStartingWaypoint = (
  waypoints?: Waypoints,
): StartingWaypoint => {
  invariant(
    waypoints != null,
    'Cannot get starting waypoints because none are defined',
  )

  console.log({ waypoints })

  const [startingPoint] = waypoints

  return startingPoint
}
