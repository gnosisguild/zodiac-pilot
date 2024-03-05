// This script will be injected via contentScripts.ts into the browser iframe running the Dapp.

import InjectedProvider from './bridge/InjectedProvider'
declare let window: Window & { ethereum: InjectedProvider }

if (window.ethereum) {
  // There is already a provider injected
  const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum')
  if (descriptor?.configurable === false) {
    // We got a problem: The provider is not configurable (most probably Rabby)
    alert(
      'Zodiac Pilot is unable to connect. In Rabby, flip the setting so it is banned and reload the page.'
    )
  }
}

// inject bridged ethereum provider
const injectedProvider = new InjectedProvider()
window.ethereum = injectedProvider
console.log('injected into', document.title)

// establish message bridge for location requests
window.addEventListener('message', (ev: MessageEvent) => {
  const { zodiacPilotHrefRequest, zodiacPilotReloadRequest } = ev.data
  if (zodiacPilotHrefRequest) {
    if (!window.top) throw new Error('Must run inside iframe')
    window.top.postMessage(
      {
        zodiacPilotHrefResponse: true,
        href: window.location.href,
      },
      '*'
    )
  }

  if (zodiacPilotReloadRequest) {
    window.location.reload()
  }
})

/**
 * EIP-6963 support
 **/

const announceEip6963Provider = (provider: InjectedProvider) => {
  const info = {
    uuid: '2a0c727b-4359-49a0-920c-b411d32b1d1e', // random uuid
    name: 'Zodiac Pilot',
    // icon: 'TODO',
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

window.dispatchEvent(new Event('ethereum#initialized'))

export {}
