import { Alert, Button } from '@/components'
import { useWalletConnect } from '@/providers'
import { ProviderType } from '@/types'
import { invariant } from '@epic-web/invariant'
import { ChainId, PrefixedAddress } from 'ser-kit'
import { CHAIN_NAME } from '../../../../chains'
import { isConnectedTo } from '../../routeHooks'
import { Account } from '../Account'

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
      <div className="flex flex-col gap-4">
        <Account providerType={ProviderType.WalletConnect}>
          {pilotAddress}
        </Account>

        <Button onClick={() => walletConnect.disconnect()}>Disconnect</Button>
      </div>
    )
  }

  if (
    walletConnect.accounts.some((acc) => acc.toLowerCase() === pilotAddress) &&
    walletConnect.chainId !== chainId
  ) {
    const chainName = CHAIN_NAME[chainId] || `#${chainId}`

    return (
      <div className="flex flex-col gap-4">
        <Account providerType={ProviderType.WalletConnect}>
          {pilotAddress}
        </Account>

        <Alert title="Chain mismatch">
          The connected wallet belongs to a different chain. Connect a wallet on{' '}
          {chainName} to use Pilot.
        </Alert>

        <Button onClick={() => walletConnect.disconnect()}>Disconnect</Button>
      </div>
    )
  }
}
