import { useWalletConnect } from '@/providers'
import { ProviderType } from '@/types'
import { invariant } from '@epic-web/invariant'
import { ChainId, PrefixedAddress } from 'ser-kit'
import { isConnectedTo } from '../../routeHooks'
import { Account } from '../Account'
import { Connected } from '../Connected'
import { SwitchChain } from '../SwitchChain'

type WalletConnectProps = {
  routeId: string
  pilotAddress: string
  initiator: PrefixedAddress | undefined
  chainId: ChainId
}

export const WalletConnect = ({
  routeId,
  chainId,
  initiator,
  pilotAddress,
}: WalletConnectProps) => {
  const walletConnect = useWalletConnect(routeId)

  invariant(
    walletConnect != null,
    'Wallet connect chosen as provider but not available'
  )

  const connected =
    initiator && isConnectedTo(walletConnect, initiator, chainId)

  if (connected) {
    return (
      <Connected
        providerType={ProviderType.WalletConnect}
        pilotAddress={pilotAddress}
        onDisconnect={() => walletConnect.disconnect()}
      />
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
