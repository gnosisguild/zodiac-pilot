import { ZodiacRoute } from '@/types'
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
  ProvideSelectedZodiacRoute,
  useSelectedRouteId,
} from './SelectedRouteContext'

type Context = {
  routes: ZodiacRoute[]
  saveRoute: (route: ZodiacRoute) => void
  removeRoute: (routeId: string) => void
}

const ZodiacRoutesContext = createContext<Context>({
  routes: [],
  saveRoute() {
    throw new Error(
      '"saveRoute" is not available outside of `<ProvideZodiacRoutes />` context.'
    )
  },
  removeRoute() {
    throw new Error(
      '"removeRoute" is not available outside of `<ProvideZodiacRoutes /> context.'
    )
  },
})

export const ProvideZodiacRoutes = ({ children }: PropsWithChildren) => {
  // we store routes as individual storage entries to alleviate concurrent write issues and to avoid running into the 8kb storage entry limit
  // (see: https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync)
  const [routes, setRoute, removeRoute] =
    useStorageEntries<ZodiacRoute>('routes')

  const saveRoute = useCallback(
    (route: ZodiacRoute) => {
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
    <ZodiacRoutesContext.Provider
      value={{
        routes: routesList,
        saveRoute,
        removeRoute,
      }}
    >
      <ProvideSelectedZodiacRoute>{children}</ProvideSelectedZodiacRoute>
    </ZodiacRoutesContext.Provider>
  )
}

export const useZodiacRoutes = () => {
  const { routes } = useContext(ZodiacRoutesContext)

  return routes
}

export const useSaveZodiacRoute = () => {
  const { saveRoute } = useContext(ZodiacRoutesContext)

  return saveRoute
}

export const useRemoveZodiacRoute = () => {
  const { removeRoute } = useContext(ZodiacRoutesContext)

  return removeRoute
}

export const useMarkRouteAsUsed = () => {
  const [selectedRouteId] = useSelectedRouteId()
  const routes = useZodiacRoutes()
  const saveRoute = useSaveZodiacRoute()

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
