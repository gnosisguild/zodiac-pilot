import { SecondaryButton } from '@/components'
import { useWalletConnect, WalletConnectResult } from '@/providers'
import { ProviderType } from '@/types'
import { ChainId } from 'ser-kit'
import { Account } from '../Account'
import { Connected } from '../Connected'
import { Section } from '../Section'
import { SwitchChain } from '../SwitchChain'

type WalletConnectProps = {
  routeId: string
  pilotAddress: string
  chainId: ChainId

  isConnected: (provider: WalletConnectResult) => boolean
}

export const WalletConnect = ({
  routeId,
  pilotAddress,
  chainId,
  isConnected,
}: WalletConnectProps) => {
  const walletConnect = useWalletConnect(routeId)

  if (isConnected(walletConnect)) {
    return (
      <Connected onDisconnect={() => walletConnect.disconnect()}>
        <Account providerType={ProviderType.WalletConnect}>
          {pilotAddress}
        </Account>
      </Connected>
    )
  }

  const knownAccount = walletConnect.accounts.some(
    (acc) => acc.toLowerCase() === pilotAddress
  )

  if (knownAccount === false) {
    return (
      <Section>
        <Account providerType={ProviderType.WalletConnect}>
          {pilotAddress}
        </Account>

        <SecondaryButton onClick={() => walletConnect.disconnect()}>
          Disconnect
        </SecondaryButton>
      </Section>
    )
  }

  if (walletConnect.chainId !== chainId) {
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
