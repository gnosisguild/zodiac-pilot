import { useEffect, useRef } from 'react'
import {
  createMessageHandler,
  type AllMessages,
  type HandlerFn,
} from './createMessageHandler'

export function useMessageHandler<
  Type extends AllMessages['type'],
  Message = Extract<AllMessages, { type: Type }>,
>(type: Type | Type[], onMessage: HandlerFn<Message>) {
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    const handleMessage = createMessageHandler(type, (message, options) =>
      onMessageRef.current(message as Message, options),
    )

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [type])
}
