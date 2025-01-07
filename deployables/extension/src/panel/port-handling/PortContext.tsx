import { ProvideBridgeContext } from '@/inject-bridge'
import { createContext, useContext, type PropsWithChildren } from 'react'
import { usePilotPort } from './usePilotPort'

const PortContext = createContext(false)

export const ProvidePort = ({ children }: PropsWithChildren) => {
  const { activeWindowId, portIsActive } = usePilotPort()

  return (
    <PortContext value={portIsActive}>
      <ProvideBridgeContext windowId={activeWindowId}>
        {children}
      </ProvideBridgeContext>
    </PortContext>
  )
}

export const usePilotIsReady = () => useContext(PortContext)
