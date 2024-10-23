import { useWalletConnect } from '@/providers'
import { ProviderType } from '@/types'
import { invariant } from '@epic-web/invariant'
import { useRoute } from '../../../routeHooks'
import { Account } from '../Account'
import { Connected } from '../Connected'
import { SwitchChain } from '../SwitchChain'

type WalletConnectProps = {
  routeId: string
  pilotAddress: string
}

export const WalletConnect = ({
  routeId,
  pilotAddress,
}: WalletConnectProps) => {
  const walletConnect = useWalletConnect(routeId)
  const { connected, chainId } = useRoute(routeId)

  invariant(
    walletConnect != null,
    'Wallet connect chosen as provider but not available'
  )

  if (connected) {
    return (
      <Connected onDisconnect={() => walletConnect.disconnect()}>
        <Account providerType={ProviderType.WalletConnect}>
          {pilotAddress}
        </Account>
      </Connected>
    )
  }

  if (
    walletConnect.accounts.some((acc) => acc.toLowerCase() === pilotAddress) &&
    walletConnect.chainId !== chainId
  ) {
    return (
      <SwitchChain
        chainId={chainId}
        onDisconnect={() => walletConnect.disconnect()}
      >
        <Account providerType={ProviderType.WalletConnect}>
          {pilotAddress}
        </Account>
      </SwitchChain>
    )
  }
}
