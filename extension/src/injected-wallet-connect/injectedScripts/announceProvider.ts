/**
 * EIP-6963 support
 **/

import type { InjectedProvider } from './InjectedProvider'

export const announceEip6963Provider = (provider: InjectedProvider) => {
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
