import type { Waypoints } from '@zodiac/schema'
import { calculateRouteId } from 'ser-kit'

export const getRouteId = (waypoints?: Waypoints | null) =>
  waypoints == null ? '' : calculateRouteId(waypoints)
