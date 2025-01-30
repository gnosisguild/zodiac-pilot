import { ZERO_ADDRESS } from '@zodiac/chains'
import { type HexAddress, ProviderType } from '@zodiac/schema'
import { useEffect, useRef } from 'react'
import { type ChainId } from 'ser-kit'
import { useAccount, useAccountEffect, useDisconnect } from 'wagmi'
import { Connect, type OnConnectArgs } from './Connect'
import { Wallet } from './Wallet'

export type ConnectWalletProps = {
  pilotAddress: HexAddress | null
  chainId?: ChainId
  onConnect?: (args: OnConnectArgs) => void
  onDisconnect?: () => void
}

export const ConnectWallet = ({
  pilotAddress,
  chainId,
  onConnect,
  onDisconnect,
}: ConnectWalletProps) => {
  const { disconnect } = useDisconnect()
  const { address } = useAccount()

  useAutoReconnect({ currentConnectedAddress: pilotAddress, onConnect })

  const accountNotConnected =
    pilotAddress == null || pilotAddress === ZERO_ADDRESS

  const disconnectRequestRef = useRef(false)

  useAccountEffect({
    onDisconnect() {
      if (disconnectRequestRef.current) {
        disconnectRequestRef.current = false

        if (onDisconnect) {
          onDisconnect()
        }
      }
    },
  })

  if (accountNotConnected) {
    return <Connect onConnect={onConnect} />
  }

  return (
    <Wallet
      chainId={chainId}
      pilotAddress={pilotAddress}
      onDisconnect={() => {
        if (address == null) {
          if (onDisconnect) {
            onDisconnect()
          }
        } else {
          disconnectRequestRef.current = true

          // Do not call the `onDisconnect` handler directly because
          // this could lead to an immediate reconnect because of a
          // race condition. Instead, we're using the `onDisconnect`
          // handler of `useAccountEffect` to tell our app only when
          // we can be sure that wagmi has disconnected from the
          // provider.
          disconnect()
        }
      }}
    />
  )
}

type UseAutoReconnectOptions = {
  currentConnectedAddress: HexAddress | null
  onConnect?: (args: OnConnectArgs) => void
}

const useAutoReconnect = ({
  currentConnectedAddress,
  onConnect,
}: UseAutoReconnectOptions) => {
  const { address, connector } = useAccount()

  const accountConnected =
    currentConnectedAddress != null && currentConnectedAddress !== ZERO_ADDRESS

  const onConnectRef = useRef(onConnect)

  useEffect(() => {
    onConnectRef.current = onConnect
  }, [onConnect])

  useEffect(() => {
    if (address == null || connector == null) {
      return
    }

    if (accountConnected) {
      return
    }

    if (onConnectRef.current == null) {
      return
    }

    onConnectRef.current({
      address,
      providerType:
        connector.type === 'injected'
          ? ProviderType.InjectedWallet
          : ProviderType.WalletConnect,
    })
  }, [accountConnected, address, connector])
}
