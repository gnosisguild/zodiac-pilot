import type { Eip1193Provider } from '@/types'
import { invariant } from '@epic-web/invariant'
import type { InjectedProvider } from './InjectedProvider'

declare let window: Window & {
  rabbyWalletRouter?: {
    setDefaultProvider(rabbyAsDefault: boolean): void
    addProvider(provider: InjectedProvider): void
    currentProvider: Eip1193Provider
    lastInjectedProvider?: Eip1193Provider
  }
}

export const isRabbyDetected = () => window.rabbyWalletRouter != null

export const rabbyTakeOver = (provider: InjectedProvider) => {
  invariant(
    window.rabbyWalletRouter,
    'Cannot take over Rabby because Rabby is not present.',
  )

  console.debug(
    '🧑‍✈️ Rabby detected, setting Pilot as default provider in Rabby Wallet Router',
  )

  const { rabbyWalletRouter } = window
  const setDefaultProvider = rabbyWalletRouter.setDefaultProvider

  rabbyWalletRouter.addProvider(provider)
  setDefaultProvider(false)
  // prevent Rabby from setting its own provider as default while Pilot is connected
  rabbyWalletRouter.setDefaultProvider = () => {}
}
