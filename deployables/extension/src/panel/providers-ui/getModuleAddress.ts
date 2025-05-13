import type { ExecutionRoute } from '@zodiac/schema'
import { ConnectionType, unprefixAddress } from 'ser-kit'

export const getModuleAddress = (route: ExecutionRoute | null) => {
  if (route == null) {
    return
  }

  const { waypoints } = route

  if (waypoints == null) {
    return
  }

  const avatarWaypoint = waypoints[waypoints.length - 1]

  if (!('connection' in avatarWaypoint)) {
    return
  }

  if (avatarWaypoint.connection.type !== ConnectionType.IS_ENABLED) {
    return
  }

  return unprefixAddress(avatarWaypoint.connection.from)
}
