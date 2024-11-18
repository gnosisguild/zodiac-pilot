// This script will be injected via executeScript to all windows in tracked tabs

import { announceEip6963Provider } from './announceProvider'
import { ensureInjectedProvider } from './ensureInjectedProvider'
import { maskMetaMaskAnnouncement } from './maskMetaMaskAnnouncement'

const enableInjectedProvider = () => {
  // This script might be injected multiple times, so we need to check if the provider is already set.
  // This should also handle the case where the extension is installed multiple times (e.g. when loading unpacked extensions).
  // We also must not inject into the connect iframes, since the point of these is connecting to the other wallet extension.
  const { provider, initial } = ensureInjectedProvider()

  if (initial) {
    maskMetaMaskAnnouncement(provider)

    window.addEventListener('eip6963:requestProvider', (event) => {
      announceEip6963Provider(provider)
      event.stopImmediatePropagation()
    })

    announceEip6963Provider(provider)

    window.dispatchEvent(new Event('ethereum#initialized'))
  }
}

enableInjectedProvider()
