// This script will be injected via executeScript to all windows in tracked tabs

import { sentry } from '@/sentry'
import { announceEip6963Provider } from './announceProvider'
import { ensureInjectedProvider } from './ensureInjectedProvider'
import { maskMetaMaskAnnouncement } from './maskMetaMaskAnnouncement'

/**
 * Some websites check for providers not based on their id
 * but on their name. For each website in this list
 * we'll use the native provider name instead of Zodiac Pilot
 * when we announce the provider.
 */
const websitesWhereZodiacNameShouldBeAvoided = ['https://etherscan.io']

const enableInjectedProvider = () => {
  // This script might be injected multiple times, so we need to check if the provider is already set.
  // This should also handle the case where the extension is installed multiple times (e.g. when loading unpacked extensions).
  // We also must not inject into the connect iframes, since the point of these is connecting to the other wallet extension.
  const { provider, initial } = ensureInjectedProvider()

  if (initial) {
    maskMetaMaskAnnouncement(provider, {
      overrideName: !websitesWhereZodiacNameShouldBeAvoided.some((url) =>
        window.location.href.startsWith(url),
      ),
    })

    window.addEventListener('eip6963:requestProvider', (event) => {
      announceEip6963Provider(provider)
      event.stopImmediatePropagation()
    })

    announceEip6963Provider(provider)

    window.dispatchEvent(new Event('ethereum#initialized'))
  }
}

try {
  enableInjectedProvider()
} catch (e) {
  sentry.captureException(e, { data: 'Could not inject provider' })
}

export default {}
