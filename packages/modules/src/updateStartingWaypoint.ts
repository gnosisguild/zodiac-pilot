import { invariant } from '@epic-web/invariant'
import { type ChainId } from '@zodiac/chains'
import type { HexAddress, StartingWaypoint } from '@zodiac/schema'
import { AccountType, splitPrefixedAddress } from 'ser-kit'
import { createEoaWaypoint } from './createEoaWaypoint'
import { createSafeStartingPoint } from './createSafeStartingPoint'

type UpdateStartingWaypointOptions = {
  chainId?: ChainId
  address?: HexAddress
}

export const updateStartingWaypoint = (
  { account }: StartingWaypoint,
  { chainId, address = account.address }: UpdateStartingWaypointOptions,
): StartingWaypoint => {
  switch (account.type) {
    case AccountType.EOA: {
      return createEoaWaypoint({ address })
    }

    default: {
      const [defaultChainId] = splitPrefixedAddress(account.prefixedAddress)

      const finalChainId = chainId || defaultChainId

      invariant(
        finalChainId != null,
        `A chain ID is needed to create a Safe starting point`,
      )

      return createSafeStartingPoint({ address, chainId: finalChainId })
    }
  }
}
