import { invariant } from '@epic-web/invariant'
import type { ExecutionRoute } from '@zodiac/schema'
import { AccountType } from 'ser-kit'

export const updateRoleId = (
  route: ExecutionRoute,
  roleId: string,
): ExecutionRoute => {
  invariant(
    route.waypoints != null,
    'Cannot update roleId of route with no waypoints',
  )

  const [startingPoint, ...waypoints] = route.waypoints

  return {
    ...route,

    waypoints: [
      startingPoint,
      ...waypoints.map((waypoint) => {
        if (waypoint.account.type !== AccountType.ROLES) {
          return waypoint
        }

        return {
          ...waypoint,

          connection: {
            ...waypoint.connection,

            roles: [roleId],
          },
        }
      }),
    ],
  }
}
