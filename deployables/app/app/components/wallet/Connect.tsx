import { type HexAddress } from '@zodiac/schema'
import { Labeled, PrimaryButton } from '@zodiac/ui'
import { ConnectKitButton, ConnectKitProvider } from 'connectkit'
import { useAccountEffect } from 'wagmi'

type ConnectProps = {
  onConnect(args: { account: HexAddress }): void
}

export const Connect = ({ onConnect }: ConnectProps) => {
  useAccountEffect({
    onConnect({ address, isReconnected }) {
      if (isReconnected) {
        return
      }

      onConnect({
        account: address,
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
