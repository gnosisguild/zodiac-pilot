import { ProviderType } from '@zodiac/schema'
import { Labeled, PrimaryButton } from '@zodiac/ui'
import { ConnectKitButton, ConnectKitProvider } from 'connectkit'
import type { ChainId } from 'ser-kit'
import { useAccountEffect } from 'wagmi'

type ConnectProps = {
  onConnect(args: {
    providerType: ProviderType
    chainId: ChainId
    account: string
  }): void
}

export const Connect = ({ onConnect }: ConnectProps) => {
  useAccountEffect({
    onConnect({ address, chainId, connector }) {
      onConnect({
        account: address,
        chainId,
        providerType:
          connector.type === 'injected'
            ? ProviderType.InjectedWallet
            : ProviderType.WalletConnect,
      })
    },
  })

  return (
    <ConnectKitProvider>
      <ConnectKitButton.Custom>
        {({ show }) => (
          <Labeled label="Pilot Account">
            <PrimaryButton onClick={show}>Connect wallet</PrimaryButton>
          </Labeled>
        )}
      </ConnectKitButton.Custom>
    </ConnectKitProvider>
  )
}
