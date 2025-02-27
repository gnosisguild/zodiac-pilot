import {
  InjectedProviderMessageTyp,
  useTabMessageHandler,
  type InjectedProviderMessage,
} from '@zodiac/messages'
import { errorToast } from '@zodiac/ui'
import { useId } from 'react'
import { useWindowId } from './BridgeContext'

export const useBridgeError = (errorMessage: string) => {
  const currentWindowId = useWindowId()
  const toastId = useId()

  useTabMessageHandler(
    InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST,
    (message, { windowId, sendResponse }) => {
      // only handle messages from the current window
      if (currentWindowId !== windowId) {
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
    },
  )
}
