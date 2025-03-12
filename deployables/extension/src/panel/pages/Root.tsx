import { ProvideCompanionAppContext } from '@/companion'
import { getLastUsedRouteId, saveLastUsedRouteId } from '@/execution-routes'
import {
  formData,
  getActiveTab,
  getString,
  sendMessageToCompanionApp,
} from '@/utils'
import { getCompanionAppUrl } from '@zodiac/env'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  useTabMessageHandler,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import {
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useSubmit,
  type ActionFunctionArgs,
} from 'react-router'
import { ClearTransactionsModal } from './ClearTransactionsModal'
import { useDeleteRoute } from './useDeleteRoute'
import { useLaunchRouteOnMessage } from './useLaunchRoute'
import { useSaveRoute } from './useSaveRoute'

export const loader = async () => {
  const lastUsedRouteId = await getLastUsedRouteId()

  return { lastUsedRouteId, companionAppUrl: getCompanionAppUrl() }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.formData()

  const routeId = getString(data, 'routeId')
  const lastUsedRouteId = await getLastUsedRouteId()

  await saveLastUsedRouteId(routeId)

  const activeTab = await getActiveTab()

  if (activeTab.id != null) {
    sendMessageToCompanionApp(activeTab.id, {
      type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
      activeRouteId: routeId,
    } satisfies CompanionResponseMessage)
  }

  if (lastUsedRouteId != null) {
    return redirect(`/${lastUsedRouteId}/clear-transactions/${routeId}`)
  }

  return redirect(`/${routeId}`)
}

export const Root = () => {
  const { lastUsedRouteId, companionAppUrl } = useLoaderData<typeof loader>()
  const [saveOptions, saveAndLaunchOptions] = useSaveRoute(lastUsedRouteId)
  useDeleteRoute()
  const submit = useSubmit()
  const { isLaunchPending, cancelLaunch, proceedWithLaunch } =
    useLaunchRouteOnMessage({
      onLaunch(routeId) {
        submit(formData({ routeId }), { method: 'POST' })
      },
    })

  useTabMessageHandler(
    CompanionAppMessageType.REQUEST_ACTIVE_ROUTE,
    async (_, { tabId }) => {
      await sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        activeRouteId: lastUsedRouteId,
      } satisfies CompanionResponseMessage)
    },
  )

  const navigate = useNavigate()

  return (
    <ProvideCompanionAppContext url={companionAppUrl}>
      <Outlet />

      <ClearTransactionsModal
        open={isLaunchPending}
        onCancel={cancelLaunch}
        onAccept={proceedWithLaunch}
      />

      <ClearTransactionsModal
        open={saveAndLaunchOptions.isLaunchPending}
        onCancel={saveAndLaunchOptions.cancelLaunch}
        onAccept={saveAndLaunchOptions.proceedWithLaunch}
      />

      <ClearTransactionsModal
        open={saveOptions.isUpdatePending}
        onCancel={saveOptions.cancelUpdate}
        onAccept={() => {
          saveOptions.saveUpdate().then((updatedRoute) => {
            navigate(
              `/${updatedRoute.id}/clear-transactions/${updatedRoute.id}`,
            )
          })
        }}
      />
    </ProvideCompanionAppContext>
  )
}
