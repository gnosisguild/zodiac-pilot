// This script will be injected via executeScript to all windows in tracked tabs

import InjectedProvider from './InjectedProvider'
import { Eip1193Provider } from '../types'

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

// This script might be injected multiple times, so we need to check if the provider is already set.
// This should also handle the case where the extension is installed multiple times (e.g. when loading unpacked extensions).
// We also must not inject into the connect iframes, since the point of these is connecting to the other wallet extension.
if (!window.zodiacPilot) {
  // inject bridged ethereum provider
  const pilotProvider = new InjectedProvider()
  window.zodiacPilot = pilotProvider

  const canSetWindowEthereum =
    Object.getOwnPropertyDescriptor(window, 'ethereum')?.configurable !== false

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

    console.log(
      '🧑‍✈️ Zodiac Pilot injected as `window.ethereum`',
      window.location.href
    )
  } else {
    // Houston, we have a problem: There is already a provider injected by another extension and it's not configurable.

    // If it's Rabby we have a trick to make sure it routes to the Pilot provider
    if (window.rabbyWalletRouter) {
      console.log(
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
  }

  /**
   * EIP-6963 support
   **/

  const announceEip6963Provider = (provider: InjectedProvider) => {
    const info = {
      uuid: '2a0c727b-4359-49a0-920c-b411d32b1d1e', // random uuid
      name: 'Zodiac Pilot',
      icon: '//pilot.gnosisguild.org/zodiac48.png',
      rdns: 'org.gnosisguild.pilot',
    }

    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({ info, provider }),
      })
    )
  }

  window.addEventListener('eip6963:requestProvider', (event) => {
    announceEip6963Provider(pilotProvider)
    event.stopImmediatePropagation()
  })

  announceEip6963Provider(pilotProvider)

  // override EIP-6963 provider announcement for MetaMask while Pilot is connected
  // (this gives us an extra chance to connect to apps that only listen to MetaMask)
  window.addEventListener('eip6963:announceProvider', (event) => {
    const ev = event as CustomEvent
    // ignore our own events
    if (ev.detail?.info?.name === 'Zodiac Pilot') return

    // override the provider announcement for MetaMask
    if (ev.detail?.info?.rdns === 'io.metamask') {
      window.dispatchEvent(
        new CustomEvent('eip6963:announceProvider', {
          detail: Object.freeze({
            info: {
              ...ev.detail.info,
              name: 'Zodiac Pilot',
              icon: '//pilot.gnosisguild.org/zodiac48.png',
            },
            provider: pilotProvider,
          }),
        })
      )
    }

    event.stopImmediatePropagation()
  })

  window.dispatchEvent(new Event('ethereum#initialized'))
}

export {}
