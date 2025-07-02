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

type ProvidePilotStatusProps = PropsWithChildren<{
  lastAccountsUpdate: Date | null
  lastRoutesUpdate: Date | null
}>

export const ProvidePilotStatus = ({
  children,
  lastAccountsUpdate,
  lastRoutesUpdate,
}: ProvidePilotStatusProps) => (
  <PilotStatusContext
    value={useUpToDateConnectedStatus({ lastAccountsUpdate, lastRoutesUpdate })}
  >
    {children}
  </PilotStatusContext>
)

type UseUpToDateConnectedStatusOptions = {
  lastAccountsUpdate: Date | null
  lastRoutesUpdate: Date | null
}

const useUpToDateConnectedStatus = ({
  lastAccountsUpdate,
  lastRoutesUpdate,
}: UseUpToDateConnectedStatusOptions) => {
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
    lastAccountsUpdate,
    lastRoutesUpdate,
    onConnect: (lastTransactionExecutedAt) => {
      setConnected(true)
      setLastTransactionExecutedAt(lastTransactionExecutedAt)
    },
  })
  useDisconnectWhenUnreachable({
    connected,
    signedIn,
    lastAccountsUpdate,
    lastRoutesUpdate,
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
