import type { ChainId } from 'ser-kit'
import { useAccount, useSwitchChain } from 'wagmi'
import { Account } from './Account'
import { Connected } from './Connected'
import { SwitchChain } from './SwitchChain'
import { WalletDisconnected } from './WalletDisconnected'
import { WrongAccount } from './WrongAccount'

type WalletProps = {
  pilotAddress: string
  chainId?: ChainId

  onDisconnect: () => void
}

export const Wallet = ({
  pilotAddress,
  chainId,
  onDisconnect,
}: WalletProps) => {
  const { address, chainId: accountChainId, addresses = [] } = useAccount()
  const { switchChain } = useSwitchChain()

  const isServer = typeof document === 'undefined'

  if (isServer) {
    return <Account>{pilotAddress}</Account>
  }

  // Wallet disconnected
  if (address == null || addresses.length === 0) {
    return (
      <WalletDisconnected>
        <Account>{pilotAddress}</Account>
      </WalletDisconnected>
    )
  }

  // Injected wallet: right account, wrong chain
  if (chainId != null && accountChainId !== chainId) {
    return (
      <SwitchChain
        chainId={chainId}
        onSwitch={() => {
          switchChain({ chainId })
        }}
        onDisconnect={onDisconnect}
      >
        <Account>{pilotAddress}</Account>
      </SwitchChain>
    )
  }

  const accountInWallet = addresses.some(
    (address) => address.toLowerCase() === pilotAddress.toLowerCase(),
  )

  if (
    !accountInWallet ||
    pilotAddress.toLowerCase() !== address.toLowerCase()
  ) {
    return (
      <WrongAccount onDisconnect={onDisconnect}>
        <Account>{pilotAddress}</Account>
      </WrongAccount>
    )
  }

  if (address != null) {
    return (
      <Connected onDisconnect={onDisconnect}>
        <Account>{pilotAddress}</Account>
      </Connected>
    )
  }
}
