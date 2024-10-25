import { Route } from '@/types'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useStorage, useStorageEntries } from '../utils'

type RouteContextT = readonly [
  Route[],
  (value: Route) => void,
  (id: string) => void,
]
const RouteContext = createContext<RouteContextT | null>(null)
type SelectedRouteContextT = readonly [string, React.Dispatch<string>]
const SelectedRouteContext = createContext<SelectedRouteContextT | null>(null)

export const ProvideRoutes: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // we store routes as individual storage entries to alleviate concurrent write issues and to avoid running into the 8kb storage entry limit
  // (see: https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync)
  const [routes, setRoute, removeRoute] = useStorageEntries<Route>('routes')

  const saveRoute = useCallback(
    (route: Route) => {
      setRoute(route.id, route)
    },
    [setRoute]
  )

  const [selectedRouteId, setSelectedRouteId] =
    useStorage<string>('selectedRoute')

  const packedRoutesContext: RouteContextT = useMemo(
    () => [Object.values(routes || {}), saveRoute, removeRoute] as const,
    [routes, saveRoute, removeRoute]
  )
  const packedSelectedRouteContext: SelectedRouteContextT = useMemo(
    () => [selectedRouteId || '', setSelectedRouteId] as const,
    [selectedRouteId, setSelectedRouteId]
  )

  // wait for routes to be loaded from storage
  if (!routes) {
    return null
  }

  return (
    <RouteContext.Provider value={packedRoutesContext}>
      <SelectedRouteContext.Provider value={packedSelectedRouteContext}>
        {children}
      </SelectedRouteContext.Provider>
    </RouteContext.Provider>
  )
}

export const useUpdateLastUsedRoute = () => {
  const [selectedRouteId] = useSelectedRouteId()
  const [routes, saveRoute] = useRoutes()

  const updateRef = useRef<(routeId: string) => void>()
  updateRef.current = (routeId: string) => {
    const route = routes.find((route) => route.id === routeId)
    if (route) {
      saveRoute({ ...route, lastUsed: Date.now() })
    }
  }

  useEffect(() => {
    console.debug('update last used timestamp for route', selectedRouteId)
    updateRef.current!(selectedRouteId)
  }, [selectedRouteId])
}

export const useRoutes = () => {
  const result = useContext(RouteContext)
  if (!result) {
    throw new Error('useRoutes must be used within a <ProvideRoutes>')
  }
  return result
}

export const useSelectedRouteId = () => {
  const result = useContext(SelectedRouteContext)
  if (!result) {
    throw new Error('useSelectedRouteId must be used within a <ProvideRoutes>')
  }
  return result
}
