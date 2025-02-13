import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { useEffect, useRef } from 'react'

type DisconnectWhenUnreachableOptions = {
  onDisconnect: () => void
}

export const useDisconnectWhenUnreachable = (
  connected: boolean,
  { onDisconnect }: DisconnectWhenUnreachableOptions,
) => {
  const onDisconnectRef = useRef(onDisconnect)

  useEffect(() => {
    onDisconnectRef.current = onDisconnect
  }, [onDisconnect])

  useEffect(() => {
    if (connected === false) {
      return
    }

    let cancelled = false

    const probeConnection = () => {
      window.postMessage(
        { type: CompanionAppMessageType.PING } satisfies CompanionAppMessage,
        '*',
      )

      const disconnectTimeout = setTimeout(() => {
        if (cancelled) {
          return
        }

        onDisconnectRef.current()
      }, 1000)

      const handlePong = (event: MessageEvent<CompanionResponseMessage>) => {
        if (event.data == null) {
          return
        }

        if (event.data.type !== CompanionResponseMessageType.PONG) {
          return
        }

        clearTimeout(disconnectTimeout)
      }

      window.addEventListener('message', handlePong)
    }

    const interval = setInterval(probeConnection, 1000)

    return () => {
      cancelled = true

      clearInterval(interval)
    }
  }, [connected])
}
