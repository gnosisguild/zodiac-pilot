import { SecondaryButton } from '@/components'
import { useWalletConnect } from '@/providers'
import { ProviderType } from '@/types'
import { invariant } from '@epic-web/invariant'
import type { ChainId } from 'ser-kit'
import { ProviderLogo } from '../providerLogo'

type WalletConnectProps = {
  routeId: string
  onConnect: (chainId: ChainId, account: string) => void
  onError: () => void
}

export const WalletConnectConnect = ({
  routeId,
  onConnect,
  onError,
}: WalletConnectProps) => {
  const walletConnect = useWalletConnect(routeId)

  return (
    <SecondaryButton
      fluid
      disabled={walletConnect == null}
      onClick={async () => {
        invariant(
          walletConnect != null,
          'walletConnect provider is not available',
        )

        const connectResult = await walletConnect.connect()

        if (connectResult == null) {
          onError()
        } else {
          const { chainId, accounts } = connectResult

          onConnect(chainId, accounts[0])
        }
      }}
    >
      <ProviderLogo providerType={ProviderType.WalletConnect} />
      Connect with WalletConnect
    </SecondaryButton>
  )
}
