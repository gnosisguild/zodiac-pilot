import type { ChainId } from '@zodiac/chains'
import { ProviderType, type HexAddress } from '@zodiac/schema'
import {
  ConnectKitButton as ConnectKitButtonBase,
  ConnectKitProvider,
} from 'connectkit'
import { useAccountEffect } from 'wagmi'

export type OnConnectArgs = {
  providerType: ProviderType
  address: HexAddress
}

type ConnectProps = {
  children: (props: { show?: () => void }) => React.ReactNode
  onConnect?: (args: OnConnectArgs) => void
  initialChainId?: ChainId
}

export const LaunchConnectKit = ({
  initialChainId,
  onConnect,
  children,
}: ConnectProps) => {
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
    <ConnectKitProvider
      options={{
        initialChainId: initialChainId ?? 0,
        hideNoWalletCTA: true,
        hideQuestionMarkCTA: true,
      }}
    >
      <ConnectKitButtonBase.Custom>
        {({ show }) => children({ show })}
      </ConnectKitButtonBase.Custom>
    </ConnectKitProvider>
  )
}
