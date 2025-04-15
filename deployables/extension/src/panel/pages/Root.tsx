import { getFeatures, ProvideCompanionAppContext } from '@/companion'
import { getLastUsedRouteId, saveLastUsedAccountId } from '@/execution-routes'
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
} from '@zodiac/messages'
import { FeatureProvider } from '@zodiac/ui'
import {
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { ClearTransactionsModal } from './ClearTransactionsModal'
import { useDeleteRoute } from './useDeleteRoute'
import { useLaunchRouteOnMessage } from './useLaunchRoute'
import { useSaveRoute } from './useSaveRoute'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const lastUsedRouteId = await getLastUsedRouteId()

  return {
    lastUsedRouteId,
    companionAppUrl: getCompanionAppUrl(),
    features: await getFeatures({ signal: request.signal }),
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.formData()

  const routeId = getString(data, 'routeId')
  const lastUsedRouteId = await getLastUsedRouteId()

  await saveLastUsedAccountId(routeId)

  const activeTab = await getActiveTab()

  if (activeTab.id != null) {
    sendMessageToCompanionApp(activeTab.id, {
      type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
      activeRouteId: routeId,
    })
  }

  if (lastUsedRouteId != null) {
    return redirect(`/${lastUsedRouteId}/clear-transactions/${routeId}`)
  }

  return redirect(`/${routeId}`)
}

const Root = () => {
  const submit = useSubmit()

  const { lastUsedRouteId, companionAppUrl, features } =
    useLoaderData<typeof loader>()
  const [saveOptions, saveAndLaunchOptions] = useSaveRoute(lastUsedRouteId, {
    onSave: (route, tabId) => {
      sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      })
    },
  })

  useDeleteRoute()

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
      })
    },
  )

  const navigate = useNavigate()

  return (
    <FeatureProvider features={features}>
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
    </FeatureProvider>
  )
}

export default Root
