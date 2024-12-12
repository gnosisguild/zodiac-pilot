import {
  getLastUsedRouteId,
  getRoutes,
  ProvideExecutionRoute,
} from '@/execution-routes'
import { ProvideProvider } from '@/providers-ui'
import { invariant } from '@epic-web/invariant'
import { Outlet, useLoaderData } from 'react-router'

export const loader = async () => {
  const lastUsedRouteId = await getLastUsedRouteId()

  invariant(lastUsedRouteId != null, 'Cannot edit routes without an active one')

  const routes = await getRoutes()

  const route = routes.find((route) => route.id === lastUsedRouteId)

  invariant(route != null, `Could not find route with id "${lastUsedRouteId}"`)

  return { route }
}

export const Routes = () => {
  const { route } = useLoaderData<typeof loader>()

  return (
    <ProvideExecutionRoute route={route}>
      <ProvideProvider>
        <Outlet />
      </ProvideProvider>
    </ProvideExecutionRoute>
  )
}
