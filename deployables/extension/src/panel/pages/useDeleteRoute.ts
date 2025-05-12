import { removeRoute } from '@/execution-routes'
import { sendMessageToCompanionApp } from '@/utils'
import { useStableHandler } from '@zodiac/hooks'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  useTabMessageHandler,
} from '@zodiac/messages'

type OnDeleteOptions = {
  onDelete: (deletedAccountId: string) => void
}

export const useDeleteRoute = ({ onDelete }: OnDeleteOptions) => {
  const onDeleteRef = useStableHandler(onDelete)

  useTabMessageHandler(
    CompanionAppMessageType.DELETE_ROUTE,
    (message, { tabId }) => {
      removeRoute(message.routeId).then(() => {
        sendMessageToCompanionApp(tabId, {
          type: CompanionResponseMessageType.DELETED_ROUTE,
        }).then(() => onDeleteRef.current(message.routeId))
      })
    },
  )
}
