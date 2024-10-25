import { Route } from '@/types'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { useStorageEntries } from '../utils'
import { ProvideSelectedZodiacRoute } from './SelectedRouteContext'

type RouteContextT = readonly [
  Route[],
  (value: Route) => void,
  (id: string) => void,
]

const ZodiacRouteContext = createContext<RouteContextT | null>(null)

export const ProvideZodiacRoutes = ({ children }: PropsWithChildren) => {
  // we store routes as individual storage entries to alleviate concurrent write issues and to avoid running into the 8kb storage entry limit
  // (see: https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync)
  const [routes, setRoute, removeRoute] = useStorageEntries<Route>('routes')

  const saveRoute = useCallback(
    (route: Route) => {
      setRoute(route.id, route)
    },
    [setRoute]
  )

  const packedRoutesContext = useMemo(
    () => [Object.values(routes || {}), saveRoute, removeRoute] as const,
    [routes, saveRoute, removeRoute]
  )

  // wait for routes to be loaded from storage
  if (!routes) {
    return null
  }

  return (
    <ZodiacRouteContext.Provider value={packedRoutesContext}>
      <ProvideSelectedZodiacRoute>{children}</ProvideSelectedZodiacRoute>
    </ZodiacRouteContext.Provider>
  )
}

export const useZodiacRoutes = () => {
  const result = useContext(ZodiacRouteContext)

  if (!result) {
    throw new Error('useRoutes must be used within a <ProvideRoutes>')
  }
  return result
}
