import { useProviderBridge } from '@/bridge'
import { getChainId } from '@/chains'
import { useProvider } from '@/providers'
import { useMarkRouteAsUsed, useZodiacRoute } from '@/zodiac-routes'
import { Outlet, RouteObject } from 'react-router-dom'
import { parsePrefixedAddress } from 'ser-kit'
import { useStorage } from '../utils'
import { EditRoute } from './edit-route'
import { ListRoutes } from './list-routes'
import { Transactions } from './transactions'

const App = () => {
  // update the last used timestamp for the current route
  useMarkRouteAsUsed()

  // make sure the injected provider stays updated on every relevant route change
  const route = useZodiacRoute()

  const chainId = getChainId(route.avatar)
  const provider = useProvider()
  const [, avatarAddress] = parsePrefixedAddress(route.avatar)

  useProviderBridge({ provider, chainId, account: avatarAddress })

  useStorage('lastUsedRoute', route.id)

  return <Outlet />
}

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Transactions />,
      },
      {
        path: '/routes',
        element: <ListRoutes />,
      },
      {
        path: '/routes/:routeId',
        element: <EditRoute />,
      },
    ],
  },
]
