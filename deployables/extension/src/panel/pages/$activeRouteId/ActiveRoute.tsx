import {
  getRoute,
  markRouteAsUsed,
  ProvideExecutionRoute,
  saveLastUsedRouteId,
} from '@/execution-routes'
import { ProvideProvider } from '@/providers-ui'
import { getActiveTab, sendMessageToTab } from '@/utils'
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
import { saveStorageEntry } from '../../utils'
import { getActiveRouteId } from './getActiveRouteId'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const activeRouteId = getActiveRouteId(params)

  try {
    const route = await getRoute(activeRouteId)

    await saveStorageEntry({ key: 'lastUsedRoute', value: route.id })

    const activeTab = await getActiveTab()

    if (activeTab.id != null) {
      sendMessageToTab(
        activeTab.id,
        {
          type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
          activeRouteId: route.id,
        } satisfies CompanionResponseMessage,
        { protocolCheckOnly: true },
      )
    }

    return { route: await markRouteAsUsed(route) }
  } catch {
    await saveLastUsedRouteId(null)

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
