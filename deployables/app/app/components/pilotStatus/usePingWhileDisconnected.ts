import { useStableHandler } from '@zodiac/hooks'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  createWindowMessageHandler,
  type CompanionAppMessage,
} from '@zodiac/messages'
import { useEffect } from 'react'
import { useActiveWhenVisible } from './useActiveWhenVisible'

type PingWhileDisconnectedOptions = {
  signedIn: boolean
  lastAccountsUpdate: Date | null
  lastRoutesUpdate: Date | null
  connected: boolean
  onConnect: (lastTransactionExecutedAt: string | null) => void
}

export const usePingWhileDisconnected = ({
  onConnect,
  connected,
  signedIn,
  lastAccountsUpdate,
  lastRoutesUpdate,
}: PingWhileDisconnectedOptions) => {
  const onConnectRef = useStableHandler(onConnect)
  const active = useActiveWhenVisible()

  useEffect(() => {
    if (connected) {
      return
    }

    if (!active) {
      return
    }

    const interval = setInterval(() => {
      window.postMessage(
        {
          type: CompanionAppMessageType.PING,
          signedIn,
          lastAccountsUpdate,
          lastRoutesUpdate,
        } satisfies CompanionAppMessage,
        '*',
      )
    }, 500)

    const handlePong = createWindowMessageHandler(
      CompanionResponseMessageType.PONG,
      ({ lastTransactionExecutedAt }) => {
        onConnectRef.current(lastTransactionExecutedAt)
      },
    )

    window.addEventListener('message', handlePong)

    return () => {
      window.removeEventListener('message', handlePong)
      clearInterval(interval)
    }
  }, [active, connected, onConnectRef, signedIn])
}
