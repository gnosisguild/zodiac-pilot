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

type ProvidePilotStatusProps = PropsWithChildren<{ signedIn: boolean }>

export const ProvidePilotStatus = ({
  children,
  signedIn,
}: ProvidePilotStatusProps) => (
  <PilotStatusContext value={useUpToDateConnectedStatus(signedIn)}>
    {children}
  </PilotStatusContext>
)

const useUpToDateConnectedStatus = (signedIn: boolean) => {
  const [connected, setConnected] = useState(false)

  useConnectChangeOnPilotEvents({
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
  })
  usePingWhileDisconnected({
    connected,
    signedIn,
    onConnect: () => setConnected(true),
  })
  useDisconnectWhenUnreachable({
    connected,
    signedIn,
    onDisconnect: () => setConnected(false),
  })

  return connected
}

export const useConnected = () => useContext(PilotStatusContext)
