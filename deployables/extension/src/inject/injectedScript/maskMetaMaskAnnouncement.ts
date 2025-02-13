import type { InjectedProvider } from './InjectedProvider'

type MetaMaskMaskOptions = {
  overrideName: boolean
}

export const maskMetaMaskAnnouncement = (
  provider: InjectedProvider,
  { overrideName }: MetaMaskMaskOptions,
) => {
  // override EIP-6963 provider announcement for MetaMask while Pilot is connected
  // (this gives us an extra chance to connect to apps that only listen to MetaMask)
  window.addEventListener('eip6963:announceProvider', (event) => {
    const ev = event as CustomEvent
    // ignore our own events
    if (ev.detail?.info?.name === 'Zodiac Pilot') {
      return
    }

    // override the provider announcement for MetaMask
    if (ev.detail?.info?.rdns === 'io.metamask') {
      window.dispatchEvent(
        new CustomEvent('eip6963:announceProvider', {
          detail: Object.freeze({
            info: {
              ...ev.detail.info,

              ...(overrideName ? { name: 'Zodiac Pilot' } : {}),

              icon: '//pilot.gnosisguild.org/zodiac48.png',
            },
            provider,
          }),
        }),
      )
    }

    event.stopImmediatePropagation()
  })
}
