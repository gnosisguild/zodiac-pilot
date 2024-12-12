import type { ExecutionRoute } from '@/types'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
} from 'react'
import { useStorageEntries } from '../utils'

type Context = {
  saveRoute: (route: ExecutionRoute) => void
  removeRoute: (routeId: string) => void
}

const ExecutionRoutesContext = createContext<Context>({
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
  const [, setRoute, removeRoute] = useStorageEntries<ExecutionRoute>('routes')

  const saveRoute = useCallback(
    (route: ExecutionRoute) => {
      setRoute(route.id, route)
    },
    [setRoute],
  )

  return (
    <ExecutionRoutesContext.Provider
      value={{
        saveRoute,
        removeRoute,
      }}
    >
      {children}
    </ExecutionRoutesContext.Provider>
  )
}

export const useSaveExecutionRoute = () => {
  const { saveRoute } = useContext(ExecutionRoutesContext)

  return saveRoute
}

export const useRemoveExecutionRoute = () => {
  const { removeRoute } = useContext(ExecutionRoutesContext)

  return removeRoute
}
