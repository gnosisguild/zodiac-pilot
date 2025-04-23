import { useStableHandler } from '@zodiac/hooks'
import { PilotMessageType, type Message } from '@zodiac/messages'
import { useEffect } from 'react'

type ConnectChangeOnPilotEventOptions = {
  onConnect: () => void
  onDisconnect: () => void
}

export const useConnectChangeOnPilotEvents = ({
  onConnect,
  onDisconnect,
}: ConnectChangeOnPilotEventOptions) => {
  const onConnectRef = useStableHandler(onConnect)
  const onDisconnectRef = useStableHandler(onDisconnect)

  useEffect(() => {
    const handleMessage = (event: MessageEvent<Message>) => {
      if (event.data == null) {
        return
      }

      switch (event.data.type) {
        case PilotMessageType.PILOT_CONNECT: {
          onConnectRef.current()

          break
        }

        case PilotMessageType.PILOT_DISCONNECT: {
          onDisconnectRef.current()
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [onConnectRef, onDisconnectRef])
}
