import type { ChainId } from '@zodiac/chains'
import { type Hex, type HexAddress } from '@zodiac/schema'
import { ConnectKitButton, ConnectKitProvider } from 'connectkit'
import { useAccountEffect } from 'wagmi'

export type OnConnectArgs = {
  address: HexAddress
}

type ConnectProps = {
  children: (props: { show?: () => void; address?: Hex }) => React.ReactNode
  onConnect?: (args: OnConnectArgs) => void
  initialChainId?: ChainId
}

export const LaunchConnectKit = ({
  initialChainId,
  onConnect,
  children,
}: ConnectProps) => {
  useAccountEffect({
    onConnect({ address, isReconnected }) {
      if (isReconnected) {
        return
      }

      if (onConnect == null) {
        return
      }

      onConnect({
        address,
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
      <ConnectKitButton.Custom>
        {({ show, address }) => children({ show, address })}
      </ConnectKitButton.Custom>
    </ConnectKitProvider>
  )
}
