import { createContext, Dispatch, PropsWithChildren, useContext } from 'react'
import { useStorage } from '../utils'

type Context = {
  selectedRouteId: string | undefined
  setSelectedRouteId: Dispatch<string>
}

const SelectedRouteContext = createContext<Context>({
  selectedRouteId: undefined,
  setSelectedRouteId() {
    throw new Error(
      '"setSelectedRouteId" cannot be used outside <ProvideSelectedExecutionRoute /> context.'
    )
  },
})

export const ProvideSelectedExecutionRoute = ({
  children,
}: PropsWithChildren) => {
  const [selectedRouteId, setSelectedRouteId] =
    useStorage<string>('selectedRoute')

  return (
    <SelectedRouteContext.Provider
      value={{
        selectedRouteId,
        setSelectedRouteId,
      }}
    >
      {children}
    </SelectedRouteContext.Provider>
  )
}

export const useSelectedRouteId = () => {
  const { selectedRouteId, setSelectedRouteId } =
    useContext(SelectedRouteContext)

  return [selectedRouteId, setSelectedRouteId] as const
}
