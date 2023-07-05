import { EventEmitter } from 'events'

import { KnownContracts } from '@gnosis.pm/zodiac'
import { nanoid } from 'nanoid'
import React, { ReactNode, useCallback, useEffect } from 'react'
import { createContext, useContext, useMemo } from 'react'

import { useMetaMask, useWalletConnect } from '../providers'
import { Connection, Eip1193Provider, ProviderType } from '../types'
import { useStickyState, validateAddress } from '../utils'

const DEFAULT_VALUE: Connection[] = [
  {
    id: nanoid(),
    label: '',
    chainId: 1,
    moduleAddress: '',
    avatarAddress: '',
    pilotAddress: '',
    providerType: ProviderType.WalletConnect,
    moduleType: undefined,
    roleId: '',
  },
]

type ConnectionContextT = [
  Connection[],
  React.Dispatch<React.SetStateAction<Connection[]>>
]
const ConnectionsContext = createContext<ConnectionContextT | null>(null)
type SelectedConnectionContextT = [string, React.Dispatch<string>]
const SelectedConnectionContext =
  createContext<SelectedConnectionContextT | null>(null)

export const ProvideConnections: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [storedConnections, setConnections] = useStickyState<Connection[]>(
    DEFAULT_VALUE,
    'connections'
  )

  const connections = migrateConnections(storedConnections)

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

export const useUpdateLastUsedConnection = () => {
  const [selectedConnectionId] = useSelectedConnectionId()
  const [, setConnections] = useConnections()

  const updateLastUsedConnection = useCallback(
    (connectionId: string) => {
      setConnections((connections: Connection[]) =>
        connections.map((connection) =>
          connection.id === connectionId
            ? { ...connection, lastUsed: Math.floor(Date.now() / 1000) }
            : connection
        )
      )
    },
    [setConnections]
  )

  useEffect(() => {
    console.debug(
      'update last used timestamp for connection',
      selectedConnectionId
    )
    updateLastUsedConnection(selectedConnectionId)
  }, [selectedConnectionId, updateLastUsedConnection])
}

export const useConnections = () => {
  const result = useContext(ConnectionsContext)
  if (!result) {
    throw new Error('useConnections must be used within a <ProvideConnections>')
  }
  return result
}

export const useSelectedConnectionId = () => {
  const result = useContext(SelectedConnectionContext)
  if (!result) {
    throw new Error(
      'useSelectedConnectionId must be used within a <ProvideConnections>'
    )
  }
  return result
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

  const metamask = useMetaMask()
  const walletConnect = useWalletConnect(connection.id)

  const provider: Eip1193Provider =
    (connection.providerType === ProviderType.MetaMask
      ? metamask.provider
      : walletConnect?.provider) || new DummyProvider() // defaulting to a dummy here makes typing when using this hook a bit easier. (we won't request anything when not connected anyways)

  const connected =
    connection.providerType === ProviderType.MetaMask
      ? metamask.accounts.includes(connection.pilotAddress) &&
        !!metamask.chainId &&
        metamask.chainId === connection.chainId
      : walletConnect?.connected

  const chainId =
    connection.providerType === ProviderType.MetaMask
      ? metamask.chainId
      : walletConnect?.chainId || null

  const mustConnectMetaMask =
    connection.providerType === ProviderType.MetaMask && !metamask.chainId

  const { pilotAddress } = connection
  const canEstablishConnection =
    !connected &&
    !!validateAddress(pilotAddress) &&
    connection.providerType === ProviderType.MetaMask &&
    metamask.accounts.includes(pilotAddress) &&
    metamask.chainId !== connection.chainId

  const connectMetaMask = metamask.connect
  const switchChain = metamask.switchChain
  const requiredChainId = connection.chainId

  useEffect(() => {
    if (mustConnectMetaMask) {
      connectMetaMask()
    }
  }, [mustConnectMetaMask, connectMetaMask])

  const connect = useCallback(async () => {
    if (chainId !== requiredChainId) {
      try {
        await switchChain(requiredChainId)
      } catch (e) {
        console.error('Error switching chain', e)
        return false
      }
    }

    return true
  }, [switchChain, chainId, requiredChainId])

  return {
    connection,
    provider,
    connected,
    chainId,

    /** If this callback is set, it can be invoked to establish a connection to the Pilot wallet by asking the user to switch it to the right chain. */
    connect: canEstablishConnection ? connect : null,
  }
}

class DummyProvider extends EventEmitter {
  async request(): Promise<void> {
    return
  }
}

type ConnectionStateMigration = (connection: Connection) => Connection

// If the Connection state structure changes we must lazily migrate users' connections states from the old structure to the new one.
// This is done by adding an idempotent migration function to this array.
const CONNECTION_STATE_MIGRATIONS: ConnectionStateMigration[] = [
  function addModuleType(connection) {
    // This migration adds the moduleType property to the connection object.
    // All existing connections without moduleType are assumed to use the Roles mod, since that was the only supported module type at the time.
    let moduleType = connection.moduleType
    if (!moduleType && connection.moduleAddress) {
      moduleType = KnownContracts.ROLES
    }
    return {
      ...connection,
      moduleType,
    }
  },

  function lowercaseAddresses(connection) {
    // This migration lowercases all addresses in the connection object.
    return {
      ...connection,
      moduleAddress: connection.moduleAddress
        ? connection.moduleAddress.toLowerCase()
        : '',
      avatarAddress: connection.avatarAddress.toLowerCase(),
      pilotAddress: connection.pilotAddress.toLowerCase(),
    }
  },
]

// Apply all migrations to the given connections
const migrateConnections = (connections: Connection[]): Connection[] => {
  let migratedConnections = connections
  CONNECTION_STATE_MIGRATIONS.forEach((migration) => {
    migratedConnections = migratedConnections.map(migration)
  })
  return migratedConnections
}
