import { RawAddress } from '@/components'
import { validateAddress } from '@/utils'
import { ProviderType } from '../../../types'
import metamaskLogoUrl from './metamask-logo.svg'
import walletConnectLogoUrl from './wallet-connect-logo.png'

type AccountProps = {
  providerType: ProviderType
  children: string
}

export const Account = ({ providerType, children }: AccountProps) => {
  return (
    <div className="flex items-center gap-4 overflow-hidden">
      <div className="border-zodiac-dark-green relative flex size-12 flex-shrink-0 items-center justify-center rounded-full border">
        {providerType === ProviderType.WalletConnect && (
          <img
            src={chrome.runtime.getURL(walletConnectLogoUrl)}
            alt="wallet connect logo"
          />
        )}

        {providerType === ProviderType.InjectedWallet && (
          <img
            src={chrome.runtime.getURL(metamaskLogoUrl)}
            alt="metamask logo"
            className="size-4/5"
          />
        )}
      </div>

      <RawAddress>{validateAddress(children)}</RawAddress>
    </div>
  )
}
