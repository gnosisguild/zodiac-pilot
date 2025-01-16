import { getChainId, type ChainId } from '@zodiac/chains'
import type { HexAddress, StartingWaypoint } from '@zodiac/schema'
import { AccountType } from 'ser-kit'
import { createEoaWaypoint } from './createEoaWaypoint'
import { createSafeStartingPoint } from './createSafeStartingPoint'

type UpdateStartingWaypointOptions = {
  chainId?: ChainId
  address?: HexAddress
}

export const updateStartingWaypoint = (
  { account }: StartingWaypoint,
  {
    chainId = getChainId(account.prefixedAddress),
    address = account.address,
  }: UpdateStartingWaypointOptions,
): StartingWaypoint => {
  switch (account.type) {
    case AccountType.EOA: {
      return createEoaWaypoint({ address, chainId })
    }

    default: {
      return createSafeStartingPoint({ address, chainId })
    }
  }
}
