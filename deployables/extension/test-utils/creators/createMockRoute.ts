import { ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@/chains'
import { type ExecutionRoute, ProviderType } from '@/types'
import { randomUUID } from 'crypto'
import { AccountType, formatPrefixedAddress } from 'ser-kit'
import { randomHex } from './randomHex'

export const createMockRoute = (
  route: Partial<ExecutionRoute> = {},
): ExecutionRoute => ({
  id: randomUUID(),
  avatar: formatPrefixedAddress(1, randomHex(40)),
  label: '',
  initiator: undefined,
  providerType: ProviderType.InjectedWallet,
  waypoints: [
    {
      account: {
        type: AccountType.EOA,
        address: ZERO_ADDRESS,
        prefixedAddress: ETH_ZERO_ADDRESS,
      },
    },
  ],

  ...route,
})
