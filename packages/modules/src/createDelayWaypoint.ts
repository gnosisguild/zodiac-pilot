import type { Connection, HexAddress, Waypoint } from '@zodiac/schema'
import { type ChainId } from 'ser-kit'
import { createDelayAccount } from './createDelayAccount'

type CreateDelayWaypointOptions = {
  chainId: ChainId
  moduleAddress: HexAddress
  connection: Connection
}

export const createDelayWaypoint = ({
  chainId,
  moduleAddress,
  connection,
}: CreateDelayWaypointOptions): Waypoint => ({
  account: createDelayAccount({ chainId, address: moduleAddress }),
  connection,
})
