import { ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@/chains'
import { ExecutionRoute, ProviderType } from '@/types'

import { randomUUID } from 'crypto'
import { AccountType } from 'ser-kit'

export const createMockRoute = (
  route: Partial<ExecutionRoute> = {}
): ExecutionRoute => ({
  id: randomUUID(),
  avatar: ETH_ZERO_ADDRESS,
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
