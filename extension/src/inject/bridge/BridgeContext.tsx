import { createContext, type PropsWithChildren, useContext } from 'react'

const BridgeContext = createContext<{ windowId: number | null }>({
  windowId: null,
})

type ProvideBridgeContextProps = PropsWithChildren<{ windowId: number | null }>

export const ProvideBridgeContext = ({
  children,
  windowId,
}: ProvideBridgeContextProps) => (
  <BridgeContext.Provider value={{ windowId }}>
    {children}
  </BridgeContext.Provider>
)

export const useWindowId = () => {
  const { windowId } = useContext(BridgeContext)

  return windowId
}
