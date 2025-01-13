import { ProviderType } from '@zodiac/schema'
import type { ChainId } from 'ser-kit'
import { useAccount, useReconnect, useSwitchChain } from 'wagmi'
import { Account } from './Account'
import { Connected } from './Connected'
import { SwitchChain } from './SwitchChain'
import { WalletDisconnected } from './WalletDisconnected'
import { WrongAccount } from './WrongAccount'

type WalletProps = {
  pilotAddress: string
  providerType: ProviderType
  chainId?: ChainId

  onDisconnect: () => void
}

export const Wallet = ({
  pilotAddress,
  providerType,
  chainId,
  onDisconnect,
}: WalletProps) => {
  const { address, chainId: accountChainId, addresses } = useAccount()
  const { switchChain } = useSwitchChain()
  const { reconnect } = useReconnect()

  // Wallet disconnected
  if (addresses == null || addresses.length === 0) {
    return (
      <WalletDisconnected
        onDisconnect={onDisconnect}
        onReconnect={() => reconnect()}
      >
        <Account type={providerType}>{pilotAddress}</Account>
      </WalletDisconnected>
    )
  }

  // Injected wallet: right account, wrong chain
  if (chainId != null && accountChainId !== chainId) {
    return (
      <SwitchChain
        chainId={chainId}
        onSwitch={() => switchChain({ chainId })}
        onDisconnect={onDisconnect}
      >
        <Account type={providerType}>{pilotAddress}</Account>
      </SwitchChain>
    )
  }

  const accountInWallet = addresses.some(
    (address) => address.toLowerCase() === pilotAddress,
  )

  // Wrong account
  if (!accountInWallet) {
    return (
      <WrongAccount onDisconnect={onDisconnect}>
        <Account type={providerType}>{pilotAddress}</Account>
      </WrongAccount>
    )
  }

  if (address != null) {
    return <Connected type={providerType} onDisconnect={onDisconnect} />
  }
}
