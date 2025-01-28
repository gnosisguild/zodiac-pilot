import { invariant } from '@epic-web/invariant'
import { verifyChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { type HexAddress, ProviderType } from '@zodiac/schema'
import { useEffect, useRef } from 'react'
import { type ChainId } from 'ser-kit'
import { useAccount, useDisconnect } from 'wagmi'
import { Connect } from './Connect'
import { Wallet } from './Wallet'

type OnConnectArgs = {
  providerType: ProviderType
  chainId: ChainId
  account: HexAddress
}

export type ConnectWalletProps = {
  pilotAddress: HexAddress | null
  chainId?: ChainId
  providerType?: ProviderType
  onConnect(args: OnConnectArgs): void
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

  useAutoReconnect({ currentConnectedAddress: pilotAddress, onConnect })

  const accountNotConnected =
    pilotAddress == null || pilotAddress === ZERO_ADDRESS

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

type UseAutoReconnectOptions = {
  currentConnectedAddress: HexAddress | null
  onConnect: (args: OnConnectArgs) => void
}

const useAutoReconnect = ({
  currentConnectedAddress,
  onConnect,
}: UseAutoReconnectOptions) => {
  const { address, chainId, connector } = useAccount()

  const accountConnected =
    currentConnectedAddress != null && currentConnectedAddress !== ZERO_ADDRESS

  const onConnectRef = useRef(onConnect)

  useEffect(() => {
    onConnectRef.current = onConnect
  }, [onConnect])

  useEffect(() => {
    if (address == null || chainId == null || connector == null) {
      return
    }

    if (accountConnected) {
      return
    }

    onConnectRef.current({
      account: address,
      chainId: verifyChainId(chainId),
      providerType:
        connector.type === 'injected'
          ? ProviderType.InjectedWallet
          : ProviderType.WalletConnect,
    })
  }, [accountConnected, address, chainId, connector])
}
