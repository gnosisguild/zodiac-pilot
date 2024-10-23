import { useInjectedWallet } from '@/providers'
import { ProviderType } from '@/types'
import { useRoute } from '../../../routeHooks'
import { Account } from '../Account'
import { Connected } from '../Connected'
import { SwitchChain } from '../SwitchChain'
import { WalletDisconnected } from '../WalletDisconnected'
import { WrongAccount } from '../WrongAccount'

type InjectedWalletProps = {
  pilotAddress: string
  routeId: string

  onDisconnect: () => void
}

export const InjectedWallet = ({
  pilotAddress,
  routeId,
  onDisconnect,
}: InjectedWalletProps) => {
  const injectedWallet = useInjectedWallet()
  const { connected, chainId } = useRoute(routeId)

  if (connected) {
    return (
      <Connected onDisconnect={onDisconnect}>
        <Account providerType={ProviderType.InjectedWallet}>
          {pilotAddress}
        </Account>
      </Connected>
    )
  }

  // Wallet disconnected
  if (injectedWallet.accounts.length === 0) {
    return (
      <WalletDisconnected
        onDisconnect={onDisconnect}
        onReconnect={() => injectedWallet.connect()}
      >
        <Account providerType={ProviderType.InjectedWallet}>
          {pilotAddress}
        </Account>
      </WalletDisconnected>
    )
  }

  // Injected wallet: right account, wrong chain
  if (injectedWallet.chainId !== chainId) {
    return (
      <SwitchChain
        chainId={chainId}
        onSwitch={() => injectedWallet.switchChain(chainId)}
      >
        <Account providerType={ProviderType.InjectedWallet}>
          {pilotAddress}
        </Account>
      </SwitchChain>
    )
  }

  const accountInWallet = injectedWallet.accounts.some(
    (acc) => acc.toLowerCase() === pilotAddress
  )

  // Wrong account
  if (!accountInWallet) {
    return (
      <WrongAccount onDisconnect={onDisconnect}>
        <Account providerType={ProviderType.InjectedWallet}>
          {pilotAddress}
        </Account>
      </WrongAccount>
    )
  }
}
