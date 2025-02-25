import { removeRoute } from '@/execution-routes'
import { sendMessageToTab, useMessageHandler } from '@/utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { useRevalidator } from 'react-router'

export const useDeleteRoute = () => {
  const { revalidate } = useRevalidator()

  useMessageHandler(
    CompanionAppMessageType.DELETE_ROUTE,
    (message, { tabId }) => {
      removeRoute(message.routeId).then(() => {
        sendMessageToTab(
          tabId,
          {
            type: CompanionResponseMessageType.DELETED_ROUTE,
          } satisfies CompanionResponseMessage,
          { protocolCheckOnly: true },
        ).then(() => revalidate())
      })
    },
  )
}
