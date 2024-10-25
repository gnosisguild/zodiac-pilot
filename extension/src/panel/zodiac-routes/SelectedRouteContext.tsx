import { invariant } from '@epic-web/invariant'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { useStorage } from '../utils'

type SelectedRouteContextT = readonly [string, React.Dispatch<string>]

const SelectedRouteContext = createContext<SelectedRouteContextT | null>(null)

export const ProvideSelectedZodiacRoute = ({ children }: PropsWithChildren) => {
  const [selectedRouteId, setSelectedRouteId] =
    useStorage<string>('selectedRoute')

  const packedSelectedRouteContext = useMemo(
    () => [selectedRouteId || '', setSelectedRouteId] as const,
    [selectedRouteId, setSelectedRouteId]
  )

  return (
    <SelectedRouteContext.Provider value={packedSelectedRouteContext}>
      {children}
    </SelectedRouteContext.Provider>
  )
}

export const useSelectedRouteId = () => {
  const result = useContext(SelectedRouteContext)

  invariant(
    result != null,
    'useSelectedRouteId must be used within a <ProvideRoutes>'
  )

  return result
}
