import {
  CompanionAppMessageType,
  PilotMessageType,
  type CompanionAppMessage,
  type Message,
} from '@zodiac/messages'
import { useStableHandler } from '@zodiac/ui'
import { useEffect } from 'react'

type PingWhileDisconnectedOptions = {
  onConnect: () => void
}

export const usePingWhileDisconnected = (
  connected: boolean,
  { onConnect }: PingWhileDisconnectedOptions,
) => {
  const onConnectRef = useStableHandler(onConnect)

  useEffect(() => {
    if (connected) {
      return
    }

    const interval = setInterval(() => {
      window.postMessage({
        type: CompanionAppMessageType.PING,
      } satisfies CompanionAppMessage)
    }, 500)

    const handlePong = (event: MessageEvent<Message>) => {
      if (event.data == null) {
        return
      }

      if (event.data.type !== PilotMessageType.PONG) {
        return
      }

      onConnectRef.current()
    }

    window.addEventListener('message', handlePong)

    return () => {
      window.removeEventListener('message', handlePong)
      clearInterval(interval)
    }
  }, [connected, onConnectRef])
}
