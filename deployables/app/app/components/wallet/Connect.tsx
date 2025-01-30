import { ProviderType, type HexAddress } from '@zodiac/schema'
import { Labeled, PrimaryButton } from '@zodiac/ui'
import {
  ConnectKitButton,
  ConnectKitProvider,
  Types as ConnectKitTypes,
} from 'connectkit'
import { useAccountEffect } from 'wagmi'

export type OnConnectArgs = {
  providerType: ProviderType
  address: HexAddress
}

type ConnectProps = {
  onConnect?: (args: OnConnectArgs) => void
}

const connectKitOptions: ConnectKitTypes.ConnectKitOptions = {
  initialChainId: 0,
  hideNoWalletCTA: true,
  hideQuestionMarkCTA: true,
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
        address,
        providerType:
          connector.type === 'injected'
            ? ProviderType.InjectedWallet
            : ProviderType.WalletConnect,
      })
    },
  })

  return (
    <ConnectKitProvider options={connectKitOptions}>
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
