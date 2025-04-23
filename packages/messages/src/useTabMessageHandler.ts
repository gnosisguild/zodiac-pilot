import { useStableHandler } from '@zodiac/hooks'
import { useEffect } from 'react'
import {
  createTabMessageHandler,
  type AllMessages,
  type HandlerFn,
} from './createTabMessageHandler'

export function useTabMessageHandler<
  Type extends AllMessages['type'],
  Message = Extract<AllMessages, { type: Type }>,
>(type: Type | Type[], onMessage: HandlerFn<Message>) {
  const onMessageRef = useStableHandler(onMessage)

  useEffect(() => {
    const handleMessage = createTabMessageHandler(type, (message, options) =>
      onMessageRef.current(message as Message, options),
    )

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [onMessageRef, type])
}
