import { ProviderType, type HexAddress } from '@zodiac/schema'
import { Labeled, PrimaryButton } from '@zodiac/ui'
import { ConnectKitButton, ConnectKitProvider } from 'connectkit'
import { useAccountEffect } from 'wagmi'

type ConnectProps = {
  onConnect(args: { providerType: ProviderType; account: HexAddress }): void
}

export const Connect = ({ onConnect }: ConnectProps) => {
  useAccountEffect({
    onConnect({ address, connector, isReconnected }) {
      if (isReconnected) {
        return
      }

      onConnect({
        account: address,
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
