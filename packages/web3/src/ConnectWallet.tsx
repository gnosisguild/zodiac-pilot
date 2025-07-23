import { invariant } from '@epic-web/invariant'
import { ZERO_ADDRESS } from '@zodiac/chains'
import { isHexAddress, type HexAddress } from '@zodiac/schema'
import { useEffect, useRef } from 'react'
import { type ChainId } from 'ser-kit'
import { useAccount, useAccountEffect, useDisconnect } from 'wagmi'
import { EmptyAccount } from './EmptyAccount'
import type { OnConnectArgs } from './LaunchConnectKit'
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

  const pilotAccountIsEmpty =
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

  if (pilotAccountIsEmpty) {
    return <EmptyAccount onConnect={onConnect} />
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
  const { address } = useAccount()

  const accountConnected =
    currentConnectedAddress != null && currentConnectedAddress !== ZERO_ADDRESS

  const onConnectRef = useRef(onConnect)

  useEffect(() => {
    onConnectRef.current = onConnect
  }, [onConnect])

  useEffect(() => {
    if (address == null) {
      return
    }

    if (accountConnected) {
      return
    }

    if (onConnectRef.current == null) {
      return
    }

    invariant(isHexAddress(address), `"${address}" is not a hex address`)

    onConnectRef.current({
      address,
    })
  }, [accountConnected, address])
}
