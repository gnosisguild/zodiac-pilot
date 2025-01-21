import type { Waypoint } from '@zodiac/schema'
import { ConnectionType } from 'ser-kit'

export const maybeGetRoleId = ({ connection }: Waypoint): string | null => {
  if (connection.type !== ConnectionType.IS_MEMBER) {
    return null
  }

  return connection.roles.at(0) ?? null
}
