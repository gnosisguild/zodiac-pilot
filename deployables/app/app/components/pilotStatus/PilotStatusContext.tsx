import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react'
import { useConnectChangeOnPilotEvents } from './useConnectChangeOnPilotEvents'
import { useDisconnectWhenUnreachable } from './useDisconnectWhenUnreachable'
import { usePingWhileDisconnected } from './usePingWhileDisconnected'

const PilotStatusContext = createContext(false)

export const ProvidePilotStatus = ({ children }: PropsWithChildren) => (
  <PilotStatusContext value={useUpToDateConnectedStatus()}>
    {children}
  </PilotStatusContext>
)

const useUpToDateConnectedStatus = () => {
  const [connected, setConnected] = useState(false)

  useConnectChangeOnPilotEvents({
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
  })
  usePingWhileDisconnected(connected, { onConnect: () => setConnected(true) })
  useDisconnectWhenUnreachable(connected, {
    onDisconnect: () => setConnected(false),
  })

  return connected
}

export const useConnected = () => useContext(PilotStatusContext)
