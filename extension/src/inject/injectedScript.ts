// This script will be injected via contentScripts.ts into each tab

import InjectedProvider from './InjectedProvider'
import { Eip1193Provider } from '../types'
import { PILOT_CONNECT, PILOT_DISCONNECT, Message } from './messages'
import { isPilotConnected } from './connectedState'

declare let window: Window & {
  ethereum: Eip1193Provider
  rabbyWalletRouter?: {
    setDefaultProvider(rabbyAsDefault: boolean): void
    addProvider(provider: InjectedProvider): void
    currentProvider: Eip1193Provider
    lastInjectedProvider?: Eip1193Provider
  }
}

// keep track of the original provider
let thirdPartyProvider = window.ethereum

// inject bridged ethereum provider
const pilotProvider = new InjectedProvider()

const canSetWindowEthereum =
  Object.getOwnPropertyDescriptor(window, 'ethereum')?.configurable !== false

if (canSetWindowEthereum) {
  Object.defineProperties(window, {
    ethereum: {
      get() {
        return isPilotConnected() ? pilotProvider : thirdPartyProvider
      },
      set(value) {
        thirdPartyProvider = value
      },
      configurable: false,
    },
  })
} else {
  // Houston, we have a problem: There is already a provider injected by another extension and it's not configurable

  // If it's Rabby we have a trick to make sure it routes to the Pilot provider
  if (window.rabbyWalletRouter) {
    console.log(
      'Rabby detected, setting Pilot as default provider in Rabby Wallet Router',
      window.rabbyWalletRouter
    )

    const { rabbyWalletRouter } = window
    const setDefaultProvider = rabbyWalletRouter.setDefaultProvider

    if (isPilotConnected()) {
      rabbyWalletRouter.addProvider(pilotProvider)
      setDefaultProvider(false)
      // prevent Rabby from setting its own provider as default while Pilot is connected
      rabbyWalletRouter.setDefaultProvider = () => {}
    }

    window.addEventListener('message', (ev: MessageEvent<Message>) => {
      const message = ev.data
      if (!message) return

      if (message.type === PILOT_CONNECT) {
        rabbyWalletRouter.addProvider(pilotProvider)
        setDefaultProvider(false)
        // prevent Rabby from setting its own provider as default while Pilot is connected
        rabbyWalletRouter.setDefaultProvider = () => {}
      }

      if (message.type === PILOT_DISCONNECT) {
        setDefaultProvider(true)
        rabbyWalletRouter.setDefaultProvider = setDefaultProvider
      }
    })
  } else {
    // If it's not Rabby, we have to alert the user
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

window.addEventListener('eip6963:requestProvider', () => {
  announceEip6963Provider(pilotProvider)
})

announceEip6963Provider(pilotProvider)

// override EIP-6963 provider announcement for MetaMask while Pilot is connected
// (this gives us an extra chance to connect to apps that only listen to MetaMask)
if (isPilotConnected()) {
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
            provider: pilotProvider,
          }),
        })
      )

      event.stopImmediatePropagation()
    }
  })
}

window.dispatchEvent(new Event('ethereum#initialized'))

export {}
