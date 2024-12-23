import { ETH_ZERO_ADDRESS } from '@/chains'
import { ProviderType } from '@/types'
import { nanoid } from 'nanoid'
import { saveRoute } from './saveRoute'

export const createRoute = () =>
  saveRoute({
    id: nanoid(),
    label: '',
    providerType: ProviderType.InjectedWallet,
    avatar: ETH_ZERO_ADDRESS,
    initiator: undefined,
    waypoints: undefined,
  })
