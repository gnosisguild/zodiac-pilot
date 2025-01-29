import {
  getRoute,
  markRouteAsUsed,
  ProvideExecutionRoute,
  saveLastUsedRouteId,
} from '@/execution-routes'
import { useConnectInjectedWalletIfNeeded } from '@/providers'
import { ProvideProvider } from '@/providers-ui'
import {
  Outlet,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
} from 'react-router'
import { saveStorageEntry } from '../../utils/saveStorageEntry'
import { getActiveRouteId } from './getActiveRouteId'

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

export const ActiveRoute = () => {
  const { route } = useLoaderData<typeof loader>()

  useConnectInjectedWalletIfNeeded()

  return (
    <ProvideExecutionRoute route={route}>
      <ProvideProvider>
        <Outlet />
      </ProvideProvider>
    </ProvideExecutionRoute>
  )
}
