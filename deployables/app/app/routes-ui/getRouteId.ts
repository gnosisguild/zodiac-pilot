import type { Waypoints } from '@zodiac/schema'

export const getRouteId = (waypoints?: Waypoints | null) =>
  waypoints == null
    ? ''
    : waypoints
        .map(({ account }) => account.prefixedAddress)
        .join(',')
        .toLowerCase()
