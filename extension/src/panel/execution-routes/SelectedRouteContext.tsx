import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
} from 'react'
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

type ProvideSelectedExecutionRouteProps = PropsWithChildren<{
  initialValue?: string
}>

export const ProvideSelectedExecutionRoute = ({
  children,
  initialValue,
}: ProvideSelectedExecutionRouteProps) => {
  const [selectedRouteId, setSelectedRouteId] = useStorage<string>(
    'selectedRoute',
    initialValue
  )

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
