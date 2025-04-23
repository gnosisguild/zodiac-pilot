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
  onConnect: () => void
}

export const usePingWhileDisconnected = (
  connected: boolean,
  { onConnect }: PingWhileDisconnectedOptions,
) => {
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
        } satisfies CompanionAppMessage,
        '*',
      )
    }, 500)

    const handlePong = createWindowMessageHandler(
      CompanionResponseMessageType.PONG,
      () => {
        onConnectRef.current()
      },
    )

    window.addEventListener('message', handlePong)

    return () => {
      window.removeEventListener('message', handlePong)
      clearInterval(interval)
    }
  }, [active, connected, onConnectRef])
}
