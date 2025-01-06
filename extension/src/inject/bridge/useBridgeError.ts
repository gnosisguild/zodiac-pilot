import { errorToast } from '@/components'
import {
  InjectedProviderMessageTyp,
  type InjectedProviderMessage,
} from '@/messages'
import { useEffect, useId } from 'react'
import { useWindowId } from './BridgeContext'

export const useBridgeError = () => {
  const windowId = useWindowId()
  const toastId = useId()

  useEffect(() => {
    const handleMessage = (
      message: InjectedProviderMessage,
      sender: chrome.runtime.MessageSender,
    ) => {
      // only handle messages from our extension
      if (sender.id !== chrome.runtime.id) {
        return
      }

      // only handle messages from the current window
      if (sender.tab?.windowId !== windowId) {
        return
      }

      if (
        message.type !== InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST
      ) {
        return
      }

      errorToast({
        id: toastId,
        title: 'No active route',
        message:
          'In order to connect Zodiac Pilot to a dApp you first need to create a route.',
      })
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [windowId])
}
