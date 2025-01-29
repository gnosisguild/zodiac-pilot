import { ProviderType, type HexAddress } from '@zodiac/schema'
import { Labeled, PrimaryButton } from '@zodiac/ui'
import { ConnectKitButton, ConnectKitProvider } from 'connectkit'
import { useAccountEffect } from 'wagmi'

export type OnConnectArgs = {
  providerType: ProviderType
  account: HexAddress
}

type ConnectProps = {
  onConnect?: (args: OnConnectArgs) => void
}

export const Connect = ({ onConnect }: ConnectProps) => {
  useAccountEffect({
    onConnect({ address, connector, isReconnected }) {
      if (isReconnected) {
        return
      }

      if (onConnect == null) {
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
