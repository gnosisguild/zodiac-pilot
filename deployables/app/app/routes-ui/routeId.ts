import type { Waypoints } from '@zodiac/schema'

export const routeId = (waypoints?: Waypoints | null) =>
  waypoints == null
    ? ''
    : waypoints
        .map(({ account }) => account.prefixedAddress)
        .join(',')
        .toLowerCase()
