import { PrimaryButton } from '@/components'
import { useWalletConnect } from '@/providers'
import { ProviderType } from '@/types'
import { invariant } from '@epic-web/invariant'
import { ChainId } from 'ser-kit'
import { ProviderLogo } from '../providerLogo'

type WalletConnectProps = {
  routeId: string
  onConnect: (chainId: ChainId, account: string) => void
}

export const WalletConnectConnect = ({
  routeId,
  onConnect,
}: WalletConnectProps) => {
  const walletConnect = useWalletConnect(routeId)

  return (
    <PrimaryButton
      fluid
      disabled={walletConnect == null}
      onClick={async () => {
        invariant(
          walletConnect != null,
          'walletConnect provider is not available'
        )

        const { chainId, accounts } = await walletConnect.connect()

        onConnect(chainId as ChainId, accounts[0])
      }}
    >
      <ProviderLogo providerType={ProviderType.WalletConnect} />
      Connect with WalletConnect
    </PrimaryButton>
  )
}
