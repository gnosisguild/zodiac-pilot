import { errorToast } from '@/components'
import {
  InjectedProviderMessageTyp,
  type InjectedProviderMessage,
} from '@/messages'
import { useEffect, useId } from 'react'
import { useWindowId } from './BridgeContext'

type ResponseFn = (response: InjectedProviderMessage) => void

export const useBridgeError = (errorMessage: string) => {
  const windowId = useWindowId()
  const toastId = useId()

  useEffect(() => {
    const handleMessage = (
      message: InjectedProviderMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: ResponseFn,
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
        message: errorMessage,
      })

      sendResponse({
        type: InjectedProviderMessageTyp.INJECTED_PROVIDER_ERROR,
        error: { code: 4100, message: 'No active route' },
        requestId: message.requestId,
      } satisfies InjectedProviderMessage)

      return true
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [errorMessage, toastId, windowId])
}
