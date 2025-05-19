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

type StatusContext = {
  connected: boolean
  lastTransactionExecutedAt: string | null
}

const PilotStatusContext = createContext<StatusContext>({
  connected: false,
  lastTransactionExecutedAt: null,
})

type ProvidePilotStatusProps = PropsWithChildren

export const ProvidePilotStatus = ({ children }: ProvidePilotStatusProps) => (
  <PilotStatusContext value={useUpToDateConnectedStatus()}>
    {children}
  </PilotStatusContext>
)

const useUpToDateConnectedStatus = () => {
  const [connected, setConnected] = useState(false)
  const [lastTransactionExecutedAt, setLastTransactionExecutedAt] = useState<
    string | null
  >(null)
  const signedIn = useIsSignedIn()

  useConnectChangeOnPilotEvents({
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
  })
  usePingWhileDisconnected({
    connected,
    signedIn,
    onConnect: (lastTransactionExecutedAt) => {
      setConnected(true)
      setLastTransactionExecutedAt(lastTransactionExecutedAt)
    },
  })
  useDisconnectWhenUnreachable({
    connected,
    signedIn,
    onDisconnect: () => setConnected(false),
    onHeartBeat: setLastTransactionExecutedAt,
  })

  return { connected, lastTransactionExecutedAt }
}

export const useConnected = () => {
  const { connected } = useContext(PilotStatusContext)

  return connected
}
export const useLastTransactionExecutedAt = () => {
  const { lastTransactionExecutedAt } = useContext(PilotStatusContext)

  return lastTransactionExecutedAt
}
