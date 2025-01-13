import { invariant } from '@epic-web/invariant'
import { ProviderType } from '@zodiac/schema'
import { Labeled, PrimaryButton } from '@zodiac/ui'
import { ConnectKitButton, ConnectKitProvider } from 'connectkit'
import { useEffect, useRef } from 'react'
import type { ChainId } from 'ser-kit'
import { useAccount } from 'wagmi'

type ConnectProps = {
  onConnect(args: {
    providerType: ProviderType
    chainId: ChainId
    account: string
  }): void
}

export const Connect = ({ onConnect }: ConnectProps) => {
  const { address, chainId, connector } = useAccount()
  const addressRef = useRef(address)

  useEffect(() => {
    if (addressRef.current !== address) {
      if (address != null) {
        invariant(chainId != null, 'Chain ID must be set')
        invariant(connector != null, 'Connector must be set')

        onConnect({
          account: address,
          chainId,
          providerType:
            connector.type === 'injected'
              ? ProviderType.InjectedWallet
              : ProviderType.WalletConnect,
        })
      }
    }
  }, [address, chainId, onConnect])

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
