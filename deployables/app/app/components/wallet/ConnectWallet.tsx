import { invariant } from '@epic-web/invariant'
import { verifyChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { type HexAddress, ProviderType } from '@zodiac/schema'
import { useEffect, useState } from 'react'
import { type ChainId } from 'ser-kit'
import { useAccountEffect, useDisconnect } from 'wagmi'
import { Connect } from './Connect'
import { Wallet } from './Wallet'

export type ConnectWalletProps = {
  pilotAddress: HexAddress | null
  chainId?: ChainId
  providerType?: ProviderType
  onConnect(args: {
    providerType: ProviderType
    chainId: ChainId
    account: HexAddress
  }): void
  onDisconnect(): void
}

export const ConnectWallet = ({
  pilotAddress,
  chainId,
  providerType,
  onConnect,
  onDisconnect,
}: ConnectWalletProps) => {
  const { disconnect } = useDisconnect()

  const [isConnecting, setIsConnecting] = useState(false)

  const accountNotConnected =
    pilotAddress == null || pilotAddress === ZERO_ADDRESS

  useEffect(() => {
    if (!isConnecting) {
      return
    }

    if (accountNotConnected) {
      return
    }

    setIsConnecting(false)
  }, [accountNotConnected, isConnecting])

  useAccountEffect({
    onConnect({ isReconnected, address, chainId, connector }) {
      if (isConnecting) {
        return
      }

      if (accountNotConnected && isReconnected) {
        setIsConnecting(true)

        onConnect({
          account: address,
          chainId: verifyChainId(chainId),
          providerType:
            connector.type === 'injected'
              ? ProviderType.InjectedWallet
              : ProviderType.WalletConnect,
        })
      }
    },
  })

  if (accountNotConnected) {
    return <Connect onConnect={onConnect} />
  }

  invariant(
    providerType != null,
    'providerType is required when pilotAddress is set',
  )

  return (
    <Wallet
      chainId={chainId}
      providerType={providerType}
      pilotAddress={pilotAddress}
      onDisconnect={() => {
        onDisconnect()

        disconnect()
      }}
    />
  )
}
