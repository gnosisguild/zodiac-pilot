import { useStableHandler } from '@zodiac/hooks'
import { useEffect } from 'react'
import { type AllMessages } from './createTabMessageHandler'
import {
  createWindowMessageHandler,
  type HandlerFn,
} from './createWindowMessageHandler'

export function useExtensionMessageHandler<
  Type extends AllMessages['type'],
  Message = Extract<AllMessages, { type: Type }>,
>(type: Type, onMessage: HandlerFn<Message>) {
  const onMessageRef = useStableHandler(onMessage)

  useEffect(() => {
    const handleMessage = createWindowMessageHandler(type, (message) =>
      onMessageRef.current(message as Message),
    )

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [onMessageRef, type])
}
