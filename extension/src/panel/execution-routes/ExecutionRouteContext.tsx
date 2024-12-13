import type { ExecutionRoute } from '@/types'
import { invariant } from '@epic-web/invariant'
import { createContext, useContext, type PropsWithChildren } from 'react'

const ExecutionRouteContext = createContext<{ route: ExecutionRoute | null }>({
  route: null,
})

export const ProvideExecutionRoute = ({
  route,
  children,
}: PropsWithChildren<{ route: ExecutionRoute }>) => (
  <ExecutionRouteContext.Provider value={{ route }}>
    {children}
  </ExecutionRouteContext.Provider>
)

export const useExecutionRoute = () => {
  const { route } = useContext(ExecutionRouteContext)

  invariant(route != null, 'Could not find active route on context')

  return route
}
