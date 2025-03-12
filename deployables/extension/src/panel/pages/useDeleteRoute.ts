import { removeRoute } from '@/execution-routes'
import { sendMessageToCompanionApp } from '@/utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  useTabMessageHandler,
} from '@zodiac/messages'
import { useRevalidator } from 'react-router'

export const useDeleteRoute = () => {
  const { revalidate } = useRevalidator()

  useTabMessageHandler(
    CompanionAppMessageType.DELETE_ROUTE,
    (message, { tabId }) => {
      removeRoute(message.routeId).then(() => {
        sendMessageToCompanionApp(tabId, {
          type: CompanionResponseMessageType.DELETED_ROUTE,
        }).then(() => revalidate())
      })
    },
  )
}
