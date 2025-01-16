import type { Waypoints } from '@zodiac/schema'

export const getPilotAddress = (waypoints: Waypoints) => {
  const [startingPoint] = waypoints

  return startingPoint.account.address
}
