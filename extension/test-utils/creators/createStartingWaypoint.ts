import { AccountType, type StartingPoint } from 'ser-kit'
import { randomAddress, randomPrefixedAddress } from './randomHex'

export const createStartingWaypoint = ({
  account,
}: Partial<StartingPoint> = {}): StartingPoint => ({
  account: {
    address: randomAddress(),
    prefixedAddress: randomPrefixedAddress(),
    type: AccountType.EOA,

    ...account,
  },
})
