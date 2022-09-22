import { nanoid } from 'nanoid'
import React, { ReactNode, useCallback } from 'react'
import { createContext, useContext, useMemo } from 'react'

import { useWalletConnectProvider } from '../providers'
import { Connection } from '../types'
import { useStickyState } from '../utils'

const DEFAULT_VALUE = [
  {
    id: nanoid(),
    label: '',
    moduleAddress: '',
    avatarAddress: '',
    roleId: '',
  },
]

type ConnectionContextT = [Connection[], React.Dispatch<Connection[]>]
const ConnectionsContext = createContext<ConnectionContextT | null>(null)
type SelectedConnectionContextT = [string, React.Dispatch<string>]
const SelectedConnectionContext =
  createContext<SelectedConnectionContextT | null>(null)

export const ProvideConnections: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [connections, setConnections] = useStickyState<Connection[]>(
    DEFAULT_VALUE,
    'connections'
  )
  const [selectedConnectionId, setSelectedConnectionId] =
    useStickyState<string>(connections[0].id, 'selectedConnection')

  const packedConnectionsContext: ConnectionContextT = useMemo(
    () => [connections, setConnections],
    [connections, setConnections]
  )
  const packedSelectedConnectionContext: SelectedConnectionContextT = useMemo(
    () => [selectedConnectionId, setSelectedConnectionId],
    [selectedConnectionId, setSelectedConnectionId]
  )

  return (
    <ConnectionsContext.Provider value={packedConnectionsContext}>
      <SelectedConnectionContext.Provider
        value={packedSelectedConnectionContext}
      >
        {children}
      </SelectedConnectionContext.Provider>
    </ConnectionsContext.Provider>
  )
}

export const useConnections = () => {
  const result = useContext(ConnectionsContext)
  if (!result) {
    throw new Error('useConnections must be used within a <ProvideConnections>')
  }
  return result
}

const useSelectedConnectionId = () => {
  const result = useContext(SelectedConnectionContext)
  if (!result) {
    throw new Error(
      'useSelectedConnectionId must be used within a <ProvideConnections>'
    )
  }
  return result
}

export const useSelectConnection = () => {
  const [, setSelectedConnectionId] = useSelectedConnectionId()
  return useCallback(
    (connectionId: string) => {
      setSelectedConnectionId(connectionId)
    },
    [setSelectedConnectionId]
  )
}

export const useConnection = (id?: string) => {
  const [connections] = useConnections()
  const [selectedConnectionId] = useSelectedConnectionId()
  const connectionId = id || selectedConnectionId
  const connection =
    (connectionId && connections.find((c) => c.id === connectionId)) ||
    connections[0]
  if (!connection) {
    throw new Error('connections is empty, which must never happen')
  }
  const { provider, connected } = useWalletConnectProvider(connection.id)
  return { connection, provider, connected }
}
