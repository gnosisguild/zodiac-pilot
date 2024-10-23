import { useInjectedWallet } from '@/providers'
import { ProviderType } from '@/types'
import { ChainId, PrefixedAddress } from 'ser-kit'
import { isConnectedTo } from '../../routeHooks'
import { Account } from '../Account'
import { Connected } from '../Connected'
import { SwitchChain } from '../SwitchChain'
import { WalletDisconnected } from '../WalletDisconnected'
import { WrongAccount } from '../WrongAccount'

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
      <Connected
        providerType={ProviderType.InjectedWallet}
        pilotAddress={pilotAddress}
        onDisconnect={onDisconnect}
      />
    )
  }

  const accountInWallet = injectedWallet.accounts.some(
    (acc) => acc.toLowerCase() === pilotAddress
  )

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
  if (accountInWallet && injectedWallet.chainId !== chainId) {
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
