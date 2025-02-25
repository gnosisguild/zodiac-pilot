import type {
  CompanionAppMessage,
  CompanionAppMessageType,
} from '@zodiac/messages'
import { useEffect, useRef } from 'react'

type MessageOptions = {
  tabId: number
}

type OnMessageFn<Message extends CompanionAppMessage> = (
  message: Message,
  options: MessageOptions,
) => void

export function useMessageHandler<
  Type extends CompanionAppMessageType,
  Message extends CompanionAppMessage = Extract<
    CompanionAppMessage,
    { type: Type }
  >,
>(type: Type | Type[], onMessage: OnMessageFn<Message>) {
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    const handleMessage = (
      message: CompanionAppMessage,
      { id, tab }: chrome.runtime.MessageSender,
    ) => {
      if (id !== chrome.runtime.id) {
        return
      }

      if (tab == null || tab.id == null) {
        return
      }

      if (Array.isArray(type)) {
        if (type.every((type) => type !== message.type)) {
          return
        }
      } else {
        if (message.type !== type) {
          return
        }
      }

      onMessageRef.current(message as Message, { tabId: tab.id })
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [type])
}
