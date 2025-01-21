import type { ExecutionRoute, Waypoint } from '@zodiac/schema'
import { AccountType } from 'ser-kit'
import { getWaypoints } from './getWaypoints'

export const getRolesWaypoint = (route: ExecutionRoute): Waypoint | undefined =>
  getWaypoints(route).find(
    (waypoint) => waypoint.account.type === AccountType.ROLES,
  )
