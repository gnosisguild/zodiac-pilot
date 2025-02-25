import {
  getRoute,
  markRouteAsUsed,
  ProvideExecutionRoute,
  saveLastUsedRouteId,
} from '@/execution-routes'
import { ProvideProvider } from '@/providers-ui'
import { getActiveTab, sendMessageToTab } from '@/utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { useEffect } from 'react'
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

  useEffect(() => {
    const handleRequestActiveRoute = async (
      message: CompanionAppMessage,
      { id, tab }: chrome.runtime.MessageSender,
    ) => {
      if (id !== chrome.runtime.id) {
        return
      }

      if (tab == null || tab.id == null) {
        return
      }

      if (message.type !== CompanionAppMessageType.REQUEST_ACTIVE_ROUTE) {
        return
      }

      await sendMessageToTab(
        tab.id,
        {
          type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
          activeRouteId: route.id,
        } satisfies CompanionResponseMessage,
        { protocolCheckOnly: true },
      )
    }

    chrome.runtime.onMessage.addListener(handleRequestActiveRoute)

    return () => {
      chrome.runtime.onMessage.removeListener(handleRequestActiveRoute)
    }
  }, [route.id])

  return (
    <ProvideExecutionRoute route={route}>
      <ProvideProvider>
        <Outlet />
      </ProvideProvider>
    </ProvideExecutionRoute>
  )
}
