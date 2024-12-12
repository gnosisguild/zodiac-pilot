import { ETH_ZERO_ADDRESS } from '@/chains'
import { type ExecutionRoute, ProviderType } from '@/types'
import { nanoid } from 'nanoid'

export const INITIAL_DEFAULT_ROUTE: ExecutionRoute = {
  id: nanoid(),
  label: '',
  providerType: ProviderType.InjectedWallet,
  avatar: ETH_ZERO_ADDRESS,
  initiator: undefined,
  waypoints: undefined,
}
