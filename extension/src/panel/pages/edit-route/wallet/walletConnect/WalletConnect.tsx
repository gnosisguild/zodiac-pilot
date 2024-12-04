import { SecondaryButton } from '@/components'
import { useWalletConnect, WalletConnectResult } from '@/providers'
import { ChainId } from 'ser-kit'
import { Account } from '../Account'
import { Connected } from '../Connected'
import { Section } from '../Section'
import { SwitchChain } from '../SwitchChain'
import { WalletDisconnected } from '../WalletDisconnected'

type WalletConnectProps = {
  routeId: string
  pilotAddress: string
  chainId: ChainId
  onDisconnect: () => void
  onError: () => void
  isConnected: (provider: WalletConnectResult) => boolean
}

export const WalletConnect = ({
  routeId,
  pilotAddress,
  chainId,
  onDisconnect,
  onError,
  isConnected,
}: WalletConnectProps) => {
  const walletConnect = useWalletConnect(routeId)

  const disconnect = () => {
    onDisconnect()

    walletConnect.disconnect()
  }

  if (isConnected(walletConnect)) {
    return (
      <Connected onDisconnect={disconnect}>
        <Account>{pilotAddress}</Account>
      </Connected>
    )
  }

  if (walletConnect.accounts.length === 0) {
    return (
      <WalletDisconnected
        onDisconnect={onDisconnect}
        onReconnect={async () => {
          const result = await walletConnect.connect()

          if (result == null) {
            onError()
          }
        }}
      >
        <Account>{pilotAddress}</Account>
      </WalletDisconnected>
    )
  }

  const knownAccount = walletConnect.accounts.some(
    (acc) => acc.toLowerCase() === pilotAddress
  )

  if (knownAccount === false) {
    return (
      <Section>
        <Account>{pilotAddress}</Account>
        <SecondaryButton onClick={disconnect}>Disconnect</SecondaryButton>
      </Section>
    )
  }

  if (walletConnect.chainId !== chainId) {
    return (
      <SwitchChain chainId={chainId} onDisconnect={disconnect}>
        <Account>{pilotAddress}</Account>
      </SwitchChain>
    )
  }
}