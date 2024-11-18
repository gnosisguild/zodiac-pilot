import { Eip1193Provider } from '@/types'
import { InjectedProvider } from './InjectedProvider'

declare let window: Window & {
  zodiacPilot?: InjectedProvider
  ethereum?: Eip1193Provider
  rabbyWalletRouter?: {
    setDefaultProvider(rabbyAsDefault: boolean): void
    addProvider(provider: InjectedProvider): void
    currentProvider: Eip1193Provider
    lastInjectedProvider?: Eip1193Provider
  }
}

export const ensureInjectedProvider = () => {
  if (window.zodiacPilot != null) {
    return { provider: window.zodiacPilot, initial: false }
  }
  // inject bridged ethereum provider
  const pilotProvider = new InjectedProvider()
  window.zodiacPilot = pilotProvider

  const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum')
  const canSetWindowEthereum =
    descriptor == null || descriptor.configurable !== false

  if (canSetWindowEthereum) {
    Object.defineProperties(window, {
      ethereum: {
        get() {
          return pilotProvider
        },
        set() {},
        configurable: false,
      },
    })

    console.debug(
      '🧑‍✈️ Zodiac Pilot injected as `window.ethereum`',
      window.location.href
    )

    return { provider: pilotProvider, initial: true }
  }
  // Houston, we have a problem: There is already a provider injected by another extension and it's not configurable.

  // If it's Rabby we have a trick to make sure it routes to the Pilot provider
  if (window.rabbyWalletRouter) {
    console.debug(
      '🧑‍✈️ Rabby detected, setting Pilot as default provider in Rabby Wallet Router'
    )

    const { rabbyWalletRouter } = window
    const setDefaultProvider = rabbyWalletRouter.setDefaultProvider

    rabbyWalletRouter.addProvider(pilotProvider)
    setDefaultProvider(false)
    // prevent Rabby from setting its own provider as default while Pilot is connected
    rabbyWalletRouter.setDefaultProvider = () => {}
  } else {
    // If it's not Rabby, we have to alert the user
    console.error(
      'Zodiac Pilot is unable to connect because of another wallet extension. Disable the other extension and reload the page.'
    )
    alert(
      'Zodiac Pilot is unable to connect because of another wallet extension. Disable the other extension and reload the page.'
    )
  }

  return { provider: pilotProvider, initial: true }
}
