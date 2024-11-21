import { InjectedWalletContextT, useInjectedWallet } from '@/providers'
import { ProviderType } from '@/types'
import { ChainId } from 'ser-kit'
import { Account } from '../Account'
import { Connected } from '../Connected'
import { SwitchChain } from '../SwitchChain'
import { WalletDisconnected } from '../WalletDisconnected'
import { WrongAccount } from '../WrongAccount'

type InjectedWalletProps = {
  pilotAddress: string
  chainId: ChainId

  onDisconnect: () => void
  onError: () => void
  isConnected: (provider: InjectedWalletContextT) => boolean
}

export const InjectedWallet = ({
  pilotAddress,
  chainId,
  onDisconnect,
  onError,
  isConnected,
}: InjectedWalletProps) => {
  const injectedWallet = useInjectedWallet()

  if (isConnected(injectedWallet)) {
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
        onReconnect={async () => {
          const result = await injectedWallet.connect()

          if (result == null) {
            onError()
          }
        }}
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
