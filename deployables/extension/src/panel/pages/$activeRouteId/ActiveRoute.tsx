import { ProvideAccount } from '@/companion'
import {
  getRoute,
  ProvideExecutionRoute,
  saveLastUsedRouteId,
  toAccount,
} from '@/execution-routes'
import { ProvideProvider } from '@/providers-ui'
import { sentry } from '@/sentry'
import { getActiveTab, sendMessageToCompanionApp } from '@/utils'
import { CompanionResponseMessageType } from '@zodiac/messages'
import {
  Outlet,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
} from 'react-router'
import { getActiveRouteId } from './getActiveRouteId'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const activeRouteId = getActiveRouteId(params)

  try {
    const route = await getRoute(activeRouteId)

    await saveLastUsedRouteId(route.id)

    const activeTab = await getActiveTab()

    if (activeTab.id != null) {
      await sendMessageToCompanionApp(activeTab.id, {
        type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        activeRouteId: route.id,
      })
    }

    return {
      route,
      account: toAccount(route),
    }
  } catch (error) {
    await saveLastUsedRouteId(null)

    sentry.captureException(error)

    throw redirect('/')
  }
}

const ActiveRoute = () => {
  const { route, account } = useLoaderData<typeof loader>()

  return (
    <ProvideAccount account={account}>
      <ProvideExecutionRoute route={route}>
        <ProvideProvider>
          <Outlet />
        </ProvideProvider>
      </ProvideExecutionRoute>
    </ProvideAccount>
  )
}

export default ActiveRoute
