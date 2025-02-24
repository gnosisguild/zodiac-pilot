import { removeRoute } from '@/execution-routes'
import { sendMessageToTab } from '@/utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { useEffect } from 'react'
import { useRevalidator } from 'react-router'

export const useDeleteRoute = () => {
  const { revalidate } = useRevalidator()

  useEffect(() => {
    const handleDelete = (
      message: CompanionAppMessage,
      { id, tab }: chrome.runtime.MessageSender,
    ) => {
      if (id !== chrome.runtime.id) {
        return
      }

      if (tab == null || tab.id == null) {
        return
      }

      if (message.type !== CompanionAppMessageType.DELETE_ROUTE) {
        return
      }

      const tabId = tab.id

      removeRoute(message.routeId).then(() => {
        revalidate()

        sendMessageToTab(tabId, {
          type: CompanionResponseMessageType.DELETED_ROUTE,
        } satisfies CompanionResponseMessage)
      })
    }

    chrome.runtime.onMessage.addListener(handleDelete)

    return () => {
      chrome.runtime.onMessage.removeListener(handleDelete)
    }
  }, [revalidate])
}
