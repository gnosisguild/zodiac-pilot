import { PrimaryButton } from '@/components'
import { useWalletConnect, WalletConnectResult } from '@/providers'
import { ProviderType } from '@/types'
import { invariant } from '@epic-web/invariant'
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

  invariant(
    walletConnect != null,
    'Wallet connect chosen as provider but not available'
  )

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

        <PrimaryButton onClick={() => walletConnect.disconnect()}>
          Disconnect
        </PrimaryButton>
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
