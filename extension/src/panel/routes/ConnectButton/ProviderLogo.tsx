import { ProviderType } from '../../../types'
import metamaskLogoUrl from './metamask-logo.svg'
import walletConnectLogoUrl from './wallet-connect-logo.png'

type ProviderLogoProps = {
  providerType: ProviderType
}

export const ProviderLogo = ({ providerType }: ProviderLogoProps) => {
  switch (providerType) {
    case ProviderType.WalletConnect:
      return (
        <img
          aria-hidden
          alt=""
          src={chrome.runtime.getURL(walletConnectLogoUrl)}
          className="size-7"
        />
      )
    case ProviderType.InjectedWallet:
      return (
        <img
          aria-hidden
          alt=""
          src={chrome.runtime.getURL(metamaskLogoUrl)}
          className="size-8"
        />
      )
  }
}
