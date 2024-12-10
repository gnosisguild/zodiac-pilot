import type { ExecutionRoute } from '@/types'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useStorageEntries } from '../utils'
import {
  ProvideSelectedExecutionRoute,
  useSelectedRouteId,
} from './SelectedRouteContext'

type Context = {
  routes: ExecutionRoute[]
  saveRoute: (route: ExecutionRoute) => void
  removeRoute: (routeId: string) => void
}

const ExecutionRoutesContext = createContext<Context>({
  routes: [],
  saveRoute() {
    throw new Error(
      '"saveRoute" is not available outside of `<ProvideExecutionRoutes />` context.'
    )
  },
  removeRoute() {
    throw new Error(
      '"removeRoute" is not available outside of `<ProvideExecutionRoutes /> context.'
    )
  },
})

export const ProvideExecutionRoutes = ({ children }: PropsWithChildren) => {
  // we store routes as individual storage entries to alleviate concurrent write issues and to avoid running into the 8kb storage entry limit
  // (see: https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync)
  const [routes, setRoute, removeRoute] =
    useStorageEntries<ExecutionRoute>('routes')

  const saveRoute = useCallback(
    (route: ExecutionRoute) => {
      setRoute(route.id, route)
    },
    [setRoute]
  )

  const routesList = useMemo(
    () => (routes == null ? [] : Object.values(routes)),
    [routes]
  )

  // wait for routes to be loaded from storage
  if (!routes) {
    return null
  }

  return (
    <ExecutionRoutesContext.Provider
      value={{
        routes: routesList,
        saveRoute,
        removeRoute,
      }}
    >
      <ProvideSelectedExecutionRoute>{children}</ProvideSelectedExecutionRoute>
    </ExecutionRoutesContext.Provider>
  )
}

export const useExecutionRoutes = () => {
  const { routes } = useContext(ExecutionRoutesContext)

  return routes
}

export const useSaveExecutionRoute = () => {
  const { saveRoute } = useContext(ExecutionRoutesContext)

  return saveRoute
}

export const useRemoveExecutionRoute = () => {
  const { removeRoute } = useContext(ExecutionRoutesContext)

  return removeRoute
}

export const useMarkRouteAsUsed = () => {
  const [selectedRouteId] = useSelectedRouteId()
  const routes = useExecutionRoutes()
  const saveRoute = useSaveExecutionRoute()

  const updateRef = useRef<(routeId: string | undefined) => void>()
  updateRef.current = (routeId) => {
    if (routeId == null) {
      return
    }

    const route = routes.find((route) => route.id === routeId)

    if (route == null) {
      return
    }

    saveRoute({ ...route, lastUsed: Date.now() })
  }

  useEffect(() => {
    console.debug('update last used timestamp for route', selectedRouteId)
    updateRef.current!(selectedRouteId)
  }, [selectedRouteId])
}
