import type { Connection, HexAddress, Waypoint } from '@zodiac/schema'
import { AccountType, prefixAddress, type ChainId } from 'ser-kit'

type CreateSafeWaypointOptions = {
  safe: HexAddress
  chainId: ChainId
  connection: Connection
}

export const createSafeWaypoint = ({
  chainId,
  safe,
  connection,
}: CreateSafeWaypointOptions): Waypoint => ({
  account: {
    type: AccountType.SAFE,
    address: safe,
    chain: chainId,
    prefixedAddress: prefixAddress(chainId, safe),
    threshold: NaN,
  },
  connection,
})
