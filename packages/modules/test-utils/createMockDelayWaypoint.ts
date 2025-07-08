import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress, Waypoint } from '@zodiac/schema'
import { ConnectionType, prefixAddress } from 'ser-kit'
import {
  createMockDelayAccount,
  type CreateDelayAccountOptions,
} from './createMockDelayAccount'

type CreateDelayWaypointOptions = CreateDelayAccountOptions & {
  pilotAddress?: HexAddress
}

export const createMockDelayWaypoint = ({
  pilotAddress = ZERO_ADDRESS,
  chainId = Chain.ETH,
  address,
}: CreateDelayWaypointOptions = {}): Waypoint => ({
  account: createMockDelayAccount({ chainId, address }),
  connection: {
    type: ConnectionType.IS_ENABLED,
    from: prefixAddress(chainId, pilotAddress),
  },
})
