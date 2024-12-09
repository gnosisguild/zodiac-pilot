import { SecondaryButton } from '@/components'
import { useInjectedWallet } from '@/providers'
import { ProviderType } from '@/types'
import type { ChainId } from 'ser-kit'
import { ProviderLogo } from '../providerLogo'

type InjectedWalletProps = {
  onConnect: (chainId: ChainId, account: string) => void
  onError: () => void
}

export const InjectedWalletConnect = ({
  onConnect,
  onError,
}: InjectedWalletProps) => {
  const injectedWallet = useInjectedWallet()

  if (injectedWallet.provider == null) {
    return null
  }

  return (
    <SecondaryButton
      fluid
      disabled={
        injectedWallet.ready === false ||
        injectedWallet.connectionStatus === 'connecting'
      }
      onClick={async () => {
        const connectResult = await injectedWallet.connect({
          force: true,
        })

        if (connectResult == null) {
          onError()
        } else {
          const { chainId, accounts } = connectResult

          onConnect(chainId, accounts[0])
        }
      }}
    >
      <ProviderLogo providerType={ProviderType.InjectedWallet} />
      {injectedWallet.connectionStatus === 'connecting'
        ? 'Connecting...'
        : 'Connect with MetaMask'}
    </SecondaryButton>
  )
}
