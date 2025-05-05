import { useIsSignedIn } from '@/auth-client'
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

type ProvidePilotStatusProps = PropsWithChildren

export const ProvidePilotStatus = ({ children }: ProvidePilotStatusProps) => (
  <PilotStatusContext value={useUpToDateConnectedStatus()}>
    {children}
  </PilotStatusContext>
)

const useUpToDateConnectedStatus = () => {
  const [connected, setConnected] = useState(false)
  const signedIn = useIsSignedIn()

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
