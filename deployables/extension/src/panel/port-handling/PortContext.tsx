import { ProvideBridgeContext } from '@/providers-ui'
import { createContext, useContext, type PropsWithChildren } from 'react'
import { useCompanionAppPort } from './useCompanionAppPort'
import { usePilotPort } from './usePilotPort'

const PortContext = createContext(false)

export const ProvidePort = ({ children }: PropsWithChildren) => {
  const { activeWindowId, portIsActive } = usePilotPort()

  useCompanionAppPort()

  return (
    <PortContext value={portIsActive}>
      <ProvideBridgeContext windowId={activeWindowId}>
        {children}
      </ProvideBridgeContext>
    </PortContext>
  )
}

export const usePilotIsReady = () => useContext(PortContext)
