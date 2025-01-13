import type { ChainId } from 'ser-kit'
import { useAccount } from 'wagmi'
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
}

export const InjectedWallet = ({
  pilotAddress,
  chainId,
  onDisconnect,
  onError,
}: InjectedWalletProps) => {
  const { address, chainId: accountChainId, addresses } = useAccount()

  // Wallet disconnected
  if (addresses == null || addresses.length === 0) {
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
        <Account>{pilotAddress}</Account>
      </WalletDisconnected>
    )
  }

  // Injected wallet: right account, wrong chain
  if (accountChainId !== chainId) {
    return (
      <SwitchChain
        chainId={chainId}
        onSwitch={() => injectedWallet.switchChain(chainId)}
        onDisconnect={onDisconnect}
      >
        <Account>{pilotAddress}</Account>
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
        <Account>{pilotAddress}</Account>
      </WrongAccount>
    )
  }

  if (address != null) {
    return <Connected onDisconnect={onDisconnect} />
  }
}
