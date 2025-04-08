import type { ExecutionRoute } from '@/types'
import { invariant } from '@epic-web/invariant'
import {
  getModuleName,
  getPilotAddress,
  getRolesWaypoint,
} from '@zodiac/modules'
import { unprefixAddress } from 'ser-kit'
import { Address } from './Address'

interface Props {
  route: ExecutionRoute
}

export const ConnectionStack = ({ route }: Props) => {
  invariant(route.waypoints != null, 'Cannot render route without waypoints')

  const pilotAddress = getPilotAddress(route.waypoints)
  const avatarAddress = unprefixAddress(route.avatar)

  const rolesWaypoint = getRolesWaypoint(route)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm">Pilot Signer</div>

        <Address address={pilotAddress} />
      </div>

      {rolesWaypoint != null && (
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {getModuleName(rolesWaypoint.account)} Mod
          </div>

          <Address address={rolesWaypoint.account.address} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm">Safe Account</div>

        <Address address={avatarAddress} />
      </div>
    </div>
  )
}
