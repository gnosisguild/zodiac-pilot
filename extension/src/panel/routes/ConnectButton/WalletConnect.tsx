import { Button } from '@/components'
import { invariant } from '@epic-web/invariant'
import { ChainId } from 'ser-kit'
import { ProviderType } from '../../../types'
import { useWalletConnect } from '../../providers'
import { ProviderLogo } from './ProviderLogo'

type WalletConnectProps = {
  routeId: string
  onConnect: (chainId: ChainId, account: string) => void
}

export const WalletConnect = ({ routeId, onConnect }: WalletConnectProps) => {
  const walletConnect = useWalletConnect(routeId)

  return (
    <Button
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
    </Button>
  )
}
