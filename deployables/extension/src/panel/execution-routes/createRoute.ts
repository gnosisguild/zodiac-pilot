import { ETH_ZERO_ADDRESS } from '@zodiac/chains'
import { nanoid } from 'nanoid'
import { saveRoute } from './saveRoute'

export const createRoute = () =>
  saveRoute({
    id: nanoid(),
    label: '',
    avatar: ETH_ZERO_ADDRESS,
    initiator: undefined,
    waypoints: undefined,
  })
