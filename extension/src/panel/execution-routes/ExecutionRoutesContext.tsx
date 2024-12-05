import { ExecutionRoute, LegacyConnection, ProviderType } from '@/types'
import { nanoid } from 'nanoid'
import {
  createContext,
  PropsWithChildren,
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
import { fromLegacyConnection } from './legacyConnectionMigrations'

type Context = {
  routes: ExecutionRoute[]
  createRoute: (route: Partial<Omit<LegacyConnection, 'id'>>) => void
  saveRoute: (route: ExecutionRoute) => void
  removeRoute: (routeId: string) => void
}

const ExecutionRoutesContext = createContext<Context>({
  routes: [],
  createRoute() {
    throw new Error(
      '"createRoute" is not available outside of `<ProvideExecutionRoutes />` context.'
    )
  },
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

  const createRoute = useCallback(
    (route: Partial<Omit<LegacyConnection, 'id'>>) => {
      const id = nanoid()

      setRoute(
        id,
        fromLegacyConnection({
          id,
          label: '',
          avatarAddress: '',
          chainId: 1,
          moduleAddress: '',
          pilotAddress: '',
          providerType: ProviderType.InjectedWallet,
          ...route,
        })
      )
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
        createRoute,
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

export const useCreateExecutionRoute = () => {
  const { createRoute } = useContext(ExecutionRoutesContext)

  return createRoute
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
