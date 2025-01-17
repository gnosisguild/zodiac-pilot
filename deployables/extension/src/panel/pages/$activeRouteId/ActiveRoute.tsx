import {
  getRoute,
  markRouteAsUsed,
  ProvideExecutionRoute,
  saveLastUsedRouteId,
  saveRoute,
} from '@/execution-routes'
import type { CompanionAppMessage } from '@/messages'
import {
  useConnectInjectedWalletIfNeeded,
  useDisconnectWalletConnectIfNeeded,
} from '@/providers'
import { ProvideProvider } from '@/providers-ui'
import { formData, getString } from '@/utils'
import { useEffect } from 'react'
import {
  Outlet,
  redirect,
  useLoaderData,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { saveStorageEntry } from '../../utils/saveStorageEntry'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from '../legacyConnectionMigrations'
import { getActiveRouteId } from './getActiveRouteId'
import { Intent } from './intents'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const activeRouteId = getActiveRouteId(params)

  try {
    const route = await getRoute(activeRouteId)

    await saveStorageEntry({ key: 'lastUsedRoute', value: route.id })

    return { route: await markRouteAsUsed(route) }
  } catch {
    await saveLastUsedRouteId(null)

    throw redirect('/')
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const data = await request.formData()

  switch (getString(data, 'intent')) {
    case Intent.disconnectProvider: {
      const routeId = getActiveRouteId(params)
      const route = await getRoute(routeId)

      await saveRoute(
        fromLegacyConnection({
          ...asLegacyConnection(route),
          pilotAddress: '',
        }),
      )

      return null
    }
  }
}

export const ActiveRoute = () => {
  const { route } = useLoaderData<typeof loader>()

  const submit = useSubmit()

  useConnectInjectedWalletIfNeeded(route)
  useDisconnectWalletConnectIfNeeded(route, {
    onDisconnect: () =>
      submit(formData({ intent: Intent.disconnectProvider }), {
        method: 'post',
      }),
  })

  useEffect(() => {
    const handleSaveRoute = (message: CompanionAppMessage) =>
      console.log({ message })

    chrome.runtime.onMessage.addListener(handleSaveRoute)

    return () => {
      chrome.runtime.onMessage.removeListener(handleSaveRoute)
    }
  }, [])

  return (
    <ProvideExecutionRoute route={route}>
      <ProvideProvider>
        <Outlet />
      </ProvideProvider>
    </ProvideExecutionRoute>
  )
}
