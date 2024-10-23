import { Alert, Button } from '@/components'
import { useInjectedWallet } from '@/providers'
import { ProviderType } from '@/types'
import { ChainId, PrefixedAddress } from 'ser-kit'
import { CHAIN_NAME } from '../../../../chains'
import { isConnectedTo } from '../../routeHooks'
import { Account } from '../Account'

type InjectedWalletProps = {
  pilotAddress: string
  chainId: ChainId
  initiator: PrefixedAddress | undefined

  onDisconnect: () => void
}

export const InjectedWallet = ({
  pilotAddress,
  chainId,
  initiator,
  onDisconnect,
}: InjectedWalletProps) => {
  const injectedWallet = useInjectedWallet()

  const connected =
    initiator && isConnectedTo(injectedWallet, initiator, chainId)

  if (connected) {
    return (
      <div className="flex flex-col gap-4">
        <Account providerType={ProviderType.InjectedWallet}>
          {pilotAddress}
        </Account>

        <Button onClick={onDisconnect}>Disconnect</Button>
      </div>
    )
  }

  const accountInWallet = injectedWallet.accounts.some(
    (acc) => acc.toLowerCase() === pilotAddress
  )

  // Wallet disconnected
  if (injectedWallet.accounts.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Alert title="Wallet disconnected">
          Your wallet is disconnected from Pilot. Reconnect it to use the
          selected account with Pilot.
        </Alert>
        <Account providerType={ProviderType.InjectedWallet}>
          {pilotAddress}
        </Account>

        <div className="flex justify-end gap-2">
          <Button onClick={() => injectedWallet.connect()}>Connect</Button>
          <Button onClick={onDisconnect}>Disconnect</Button>
        </div>
      </div>
    )
  }

  // Injected wallet: right account, wrong chain
  if (accountInWallet && injectedWallet.chainId !== chainId) {
    const chainName = CHAIN_NAME[chainId] || `#${chainId}`

    return (
      <div className="flex flex-col gap-4">
        <Alert title="Chain mismatch">
          The connected wallet belongs to a different chain. To use it you need
          to switch back to {chainName}
        </Alert>

        <Account providerType={ProviderType.InjectedWallet}>
          {pilotAddress}
        </Account>

        <Button
          onClick={() => {
            injectedWallet.switchChain(chainId)
          }}
        >
          Switch wallet to {chainName}
        </Button>
      </div>
    )
  }

  // Wrong account
  if (!accountInWallet) {
    return (
      <div className="flex flex-col gap-4">
        <Alert title="Account is not connected">
          Switch your wallet to this account in order to use Pilot.
        </Alert>

        <Account providerType={ProviderType.InjectedWallet}>
          {pilotAddress}
        </Account>

        <Button onClick={onDisconnect}>Disconnect</Button>
      </div>
    )
  }
}
