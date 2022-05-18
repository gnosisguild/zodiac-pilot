import React from 'react'
import { VscDebugDisconnect } from 'react-icons/vsc'

import { AddressStack, BlockButton, Box, Flex, Button } from '../../components'
import { useWalletConnectProvider } from '../../providers'
import { Connection } from '../../types'
import ConnectIcon from './ConnectIcon'
import { useConnections, useSelectedConnectionId } from '../connectionHooks'

import classes from './style.module.css'

const SelectConnection: React.FC = () => {
  const [connections] = useConnections()

  return (
    <Flex direction="column" gap={2}>
      <h2>Safe Connections</h2>
      {connections.map((connection) => (
        <ConnectionItem key={connection.id} connection={connection} />
      ))}
    </Flex>
  )
}

const ConnectionItem: React.FC<{ connection: Connection }> = ({
  connection,
}) => {
  const { provider, connected } = useWalletConnectProvider(connection.id)
  const [, setSelectedConnectionId] = useSelectedConnectionId()

  return (
    <BlockButton
      onClick={() => setSelectedConnectionId(connection.id)}
      className={classes.connectionButton}
    >
      <Flex direction="row" gap={2} className={classes.connectionHeader}>
        <h3>{connection.label}</h3>

        <div className={classes.status}>
          {connected ? (
            <ConnectIcon
              size={24}
              color="green"
              title="WalletConnect is connected"
            />
          ) : (
            <VscDebugDisconnect
              size={24}
              color="crimson"
              title="WalletConnect is not connected"
            />
          )}
        </div>
      </Flex>
      <AddressStack
        interactive
        avatarAddress={connection.avatarAddress}
        moduleAddress={connection.moduleAddress}
        pilotAddress={provider.accounts[0] || ''}
      />
    </BlockButton>
  )
}

export default SelectConnection
