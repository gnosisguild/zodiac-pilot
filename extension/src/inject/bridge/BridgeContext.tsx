import { invariant } from '@epic-web/invariant'
import { createContext, PropsWithChildren, useContext } from 'react'

const BridgeContext = createContext<{ windowId: number | null }>({
  windowId: null,
})

type ProvideBridgeContextProps = PropsWithChildren<{ windowId: number }>

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

  invariant(windowId != null, '"windowId" not set on BridgeContext')

  return windowId
}
