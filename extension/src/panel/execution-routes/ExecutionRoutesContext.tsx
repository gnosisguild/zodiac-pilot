import type { ExecutionRoute } from '@/types'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { useStorageEntries } from '../utils'

type Context = {
  routes: ExecutionRoute[]
  saveRoute: (route: ExecutionRoute) => void
  removeRoute: (routeId: string) => void
}

const ExecutionRoutesContext = createContext<Context>({
  routes: [],
  saveRoute() {
    throw new Error(
      '"saveRoute" is not available outside of `<ProvideExecutionRoutes />` context.',
    )
  },
  removeRoute() {
    throw new Error(
      '"removeRoute" is not available outside of `<ProvideExecutionRoutes /> context.',
    )
  },
})

type ProvideExecutionRoutesProps = PropsWithChildren

export const ProvideExecutionRoutes = ({
  children,
}: ProvideExecutionRoutesProps) => {
  // we store routes as individual storage entries to alleviate concurrent write issues and to avoid running into the 8kb storage entry limit
  // (see: https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync)
  const [routes, setRoute, removeRoute] =
    useStorageEntries<ExecutionRoute>('routes')

  const saveRoute = useCallback(
    (route: ExecutionRoute) => {
      setRoute(route.id, route)
    },
    [setRoute],
  )

  const routesList = useMemo(
    () => (routes == null ? [] : Object.values(routes)),
    [routes],
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
      {children}
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
