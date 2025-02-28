import { ProvideCompanionAppContext } from '@/companion'
import { getLastUsedRouteId } from '@/execution-routes'
import { sendMessageToTab } from '@/utils'
import { getCompanionAppUrl } from '@zodiac/env'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  useTabMessageHandler,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { Outlet, useLoaderData, useNavigate } from 'react-router'
import { FutureClearTransactionsModal } from './ClearTransactionsModal'
import { useDeleteRoute } from './useDeleteRoute'
import { useLaunchRoute } from './useLaunchRoute'
import { useSaveRoute } from './useSaveRoute'

export const loader = async () => {
  const lastUsedRouteId = await getLastUsedRouteId()

  return { lastUsedRouteId, companionAppUrl: getCompanionAppUrl() }
}

export const Root = () => {
  const { lastUsedRouteId, companionAppUrl } = useLoaderData<typeof loader>()
  const { isUpdatePending, cancelUpdate, saveUpdate } =
    useSaveRoute(lastUsedRouteId)
  useDeleteRoute()
  const { isLaunchPending, cancelLaunch, proceedWithLaunch } = useLaunchRoute()

  useTabMessageHandler(
    CompanionAppMessageType.REQUEST_ACTIVE_ROUTE,
    async (_, { tabId }) => {
      await sendMessageToTab(
        tabId,
        {
          type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
          activeRouteId: lastUsedRouteId,
        } satisfies CompanionResponseMessage,
        { protocolCheckOnly: true },
      )
    },
  )

  const navigate = useNavigate()

  return (
    <ProvideCompanionAppContext url={companionAppUrl}>
      <Outlet />

      <FutureClearTransactionsModal
        open={isLaunchPending}
        onCancel={cancelLaunch}
        onAccept={proceedWithLaunch}
      />

      <FutureClearTransactionsModal
        open={isUpdatePending}
        onCancel={cancelUpdate}
        onAccept={() => {
          saveUpdate().then((updatedRoute) => {
            navigate(
              `/${updatedRoute.id}/clear-transactions/${updatedRoute.id}`,
            )
          })
        }}
      />
    </ProvideCompanionAppContext>
  )
}
