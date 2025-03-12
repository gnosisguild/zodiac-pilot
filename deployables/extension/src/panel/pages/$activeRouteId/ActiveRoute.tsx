import {
  getRoute,
  markRouteAsUsed,
  ProvideExecutionRoute,
  saveLastUsedRouteId,
} from '@/execution-routes'
import { ProvideProvider } from '@/providers-ui'
import { sentry } from '@/sentry'
import { getActiveTab, sendMessageToCompanionApp } from '@/utils'
import {
  CompanionResponseMessageType,
  type CompanionResponseMessage,
} from '@zodiac/messages'
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
      } satisfies CompanionResponseMessage)
    }

    return { route: await markRouteAsUsed(route) }
  } catch (error) {
    await saveLastUsedRouteId(null)

    sentry.captureException(error)

    throw redirect('/')
  }
}

export const ActiveRoute = () => {
  const { route } = useLoaderData<typeof loader>()

  return (
    <ProvideExecutionRoute route={route}>
      <ProvideProvider>
        <Outlet />
      </ProvideProvider>
    </ProvideExecutionRoute>
  )
}
