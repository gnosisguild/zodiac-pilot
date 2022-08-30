import { EventEmitter } from 'events'

import { nanoid } from 'nanoid'
import React, { ReactNode, useCallback } from 'react'
import { createContext, useContext, useMemo } from 'react'

import { useMetaMaskProvider, useWalletConnectProvider } from '../providers'
import {
  Connection,
  Eip1193Provider,
  JsonRpcRequest,
  ProviderType,
} from '../types'
import { useStickyState } from '../utils'

const DEFAULT_VALUE: Connection[] = [
  {
    id: nanoid(),
    label: '',
    chainId: null,
    moduleAddress: '',
    avatarAddress: '',
    pilotAddress: '',
    providerType: ProviderType.WalletConnect,
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

  const metamask = useMetaMaskProvider()
  const walletConnect = useWalletConnectProvider(connection.id)

  const provider: Eip1193Provider =
    connection.providerType === ProviderType.MetaMask
      ? metamask.provider || new DummyProvider() // passing a dummy here makes typing when using this hook a bit easier. (we won't request anything when not connected anyways)
      : walletConnect.provider

  const connected =
    connection.providerType === ProviderType.MetaMask
      ? metamask.accounts.includes(connection.pilotAddress) &&
        !!metamask.chainId &&
        metamask.chainId === connection.chainId
      : walletConnect.provider.connected

  const chainId =
    connection.providerType === ProviderType.MetaMask
      ? metamask.chainId
      : walletConnect.provider.chainId

  return { connection, provider, connected, chainId }
}

class DummyProvider extends EventEmitter {
  async request(): Promise<void> {
    return
  }
}
