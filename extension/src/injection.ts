// This script will be injected via contentScripts.ts into the browser iframe running the Dapp.

import InjectedProvider from './bridge/InjectedProvider'
import { Eip1193Provider } from './types'

declare let window: Window & {
  ethereum: Eip1193Provider
  rabbyWalletRouter?: {
    setDefaultProvider(rabbyAsDefault: boolean): void
    addProvider(provider: InjectedProvider): void
    currentProvider: Eip1193Provider
    lastInjectedProvider?: Eip1193Provider
  }
}

// inject bridged ethereum provider
const injectedProvider = new InjectedProvider()

// keep track of provider injected by other wallet extensions
let walletProvider = window.ethereum

const canSetWindowEthereum =
  Object.getOwnPropertyDescriptor(window, 'ethereum')?.configurable !== false

if (canSetWindowEthereum) {
  Object.defineProperties(window, {
    ethereum: {
      get() {
        return injectedProvider
      },
      set(value: Eip1193Provider) {
        // store as user wallet provider so we can connect to it from the side panel
        walletProvider = value
      },
      configurable: false,
    },
  })

  console.log('Injected Zodiac Pilot provider')
} else {
  // Houston, we have a problem: There is already a provider injected by another extension and it's not configurable

  // If it's Rabby we have a trick to make sure it routes to the Pilot provider
  if (window.rabbyWalletRouter) {
    console.log(
      'Rabby detected, setting Pilot as default provider in Rabby Wallet Router',
      window.rabbyWalletRouter
    )

    const { rabbyWalletRouter } = window

    walletProvider = rabbyWalletRouter.currentProvider
    rabbyWalletRouter.addProvider(injectedProvider)
    rabbyWalletRouter.setDefaultProvider(false)
    // prevent Rabby from setting its own provider as default subsequently

    rabbyWalletRouter.setDefaultProvider = (rabbyAsDefault) => {
      const rabbyProvider: Eip1193Provider = (window as any).rabby
      if (rabbyAsDefault) {
        walletProvider = rabbyProvider
      } else {
        walletProvider = rabbyWalletRouter.lastInjectedProvider ?? rabbyProvider
      }
    }
  } else {
    // If it's not Rabby, we have to alert the user
    alert(
      'Zodiac Pilot is unable to connect because of another wallet extension. Disable the other extension and reload the page.'
    )
  }
}

console.log('injected into', document.title, chrome.runtime.id)

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

window.addEventListener('eip6963:requestProvider', () => {
  announceEip6963Provider(injectedProvider)
})

announceEip6963Provider(injectedProvider)

// override EIP-6963 provider announcement for MetaMask
window.addEventListener('eip6963:announceProvider', (event) => {
  const ev = event as CustomEvent
  if (
    ev.detail.info.rdns === 'io.metamask' &&
    ev.detail.info.name !== 'Zodiac Pilot'
  ) {
    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({
          info: {
            ...ev.detail.info,
            name: 'Zodiac Pilot',
            icon: '//pilot.gnosisguild.org/zodiac48.png',
          },
          provider: injectedProvider,
        }),
      })
    )

    // TODO proxy this event to the side panel so we can connect to this user wallet from there
  }

  event.stopImmediatePropagation()
})

window.dispatchEvent(new Event('ethereum#initialized'))

export {}
