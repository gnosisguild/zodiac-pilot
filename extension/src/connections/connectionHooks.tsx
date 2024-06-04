import { nanoid } from 'nanoid'
import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { createContext, useContext, useMemo } from 'react'

import { useMetaMask, useWalletConnect } from '../providers'
import { Connection, Eip1193Provider, ProviderType } from '../types'
import { useStickyState, validateAddress } from '../utils'
import { MetaMaskContextT } from '../providers/useMetaMask'
import { WalletConnectResult } from '../providers/useWalletConnect'
import { getEip1193ReadOnlyProvider } from '../providers/readOnlyProvider'
import { migrateConnections } from './migrations'

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
  const [connections, setConnections] = useStickyState<Connection[]>(
    DEFAULT_VALUE,
    'connections'
  )
  const [isMigrated, setIsMigrated] = useState(false)
  useEffect(() => {
    if (!isMigrated) {
      migrateConnections(connections).then((migratedConnections) => {
        setConnections(migratedConnections)
        setIsMigrated(true)
      })
    }
  }, [isMigrated, connections, setConnections])

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

  if (!isMigrated) {
    return null
  }

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
  const defaultProvider = getEip1193ReadOnlyProvider(
    connection.chainId,
    connection.pilotAddress
  )

  const provider: Eip1193Provider =
    (connection.providerType === ProviderType.MetaMask
      ? metamask.provider
      : walletConnect?.provider) || defaultProvider

  const connected = isConnectedTo(
    connection.providerType === ProviderType.MetaMask
      ? metamask
      : walletConnect,
    connection.pilotAddress,
    connection.chainId
  )

  const providerChainId =
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
    metamask.accounts.some((acc) => acc.toLowerCase() === pilotAddress) &&
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
    if (requiredChainId && providerChainId !== requiredChainId) {
      try {
        await switchChain(requiredChainId)
      } catch (e) {
        console.error('Error switching chain', e)
        return false
      }
    }

    return true
  }, [switchChain, providerChainId, requiredChainId])

  return {
    connection,
    provider,
    /** Indicates if `provider` is connected to the chain set in `connection`. */
    connected,
    /** The chain ID the `provider` is currently connected to. Might be different the the chainId configured for `connection` */
    providerChainId,

    /** If this callback is set, it can be invoked to establish a connection to the Pilot wallet by asking the user to switch it to the right chain. */
    connect: canEstablishConnection ? connect : null,
  }
}

const isConnectedTo = (
  providerContext: MetaMaskContextT | WalletConnectResult | null,
  account: string,
  chainId?: number
) => {
  if (!providerContext) return false
  const accountLower = account.toLowerCase()

  return (
    providerContext &&
    (!chainId || chainId === providerContext.chainId) &&
    providerContext.accounts?.some(
      (acc) => acc.toLowerCase() === accountLower
    ) &&
    ('connected' in providerContext ? providerContext.connected : true)
  )
}
