import {
  getRoute,
  markRouteAsUsed,
  ProvideExecutionRoute,
  saveLastUsedRouteId,
  saveRoute,
} from '@/execution-routes'
import {
  useConnectInjectedWalletIfNeeded,
  useDisconnectWalletConnectIfNeeded,
} from '@/providers'
import { ProvideProvider } from '@/providers-ui'
import { formData, getString } from '@/utils'
import { ZERO_ADDRESS } from '@zodiac/chains'
import { updatePilotAddress } from '@zodiac/modules'
import {
  Outlet,
  redirect,
  useLoaderData,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { saveStorageEntry } from '../../utils/saveStorageEntry'
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

      await saveRoute(updatePilotAddress(route, ZERO_ADDRESS))

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

  return (
    <ProvideExecutionRoute route={route}>
      <ProvideProvider>
        <Outlet />
      </ProvideProvider>
    </ProvideExecutionRoute>
  )
}
