import React from 'react'
import { VscDebugDisconnect } from 'react-icons/vsc'

import { Box, BoxButton, ConnectionStack, Flex } from '../../components'
import { useConnection, useConnections } from '../../settings/connectionHooks'
import { Connection } from '../../types'

import ConnectIcon from './ConnectIcon'
import classes from './style.module.css'

interface ConnectionsListProps {
  onLaunch: (connectionId: string) => void
  onModify: (connectionId: string) => void
}

interface ConnectionItem {
  connection: Connection
  onLaunch: (connectionId: string) => void
  onModify: (connectionId: string) => void
}

const ConnectionItem: React.FC<ConnectionItem> = ({
  onLaunch,
  onModify,
  connection,
}) => {
  const { connected, connect } = useConnection(connection.id)

  const handleLaunch = () => onLaunch(connection.id)
  const handleModify = () => onModify(connection.id)

  return (
    <BoxButton
      className={classes.connectionItemContainer}
      onClick={handleLaunch}
    >
      <Flex gap={1} justifyContent="space-between" alignItems="center">
        <Flex gap={2} alignItems="center">
          <Box rounded className={classes.connectionIcon}>
            {connected && (
              <ConnectIcon
                role="status"
                size={24}
                color="green"
                title="Pilot wallet is connected"
              />
            )}
            {!connected && !connect && (
              <VscDebugDisconnect
                role="status"
                size={24}
                color="crimson"
                title="Pilot wallet is not connected"
              />
            )}
            {!connected && connect && (
              <ConnectIcon
                role="status"
                size={24}
                color="orange"
                title="Pilot wallet is connected to a different chain"
              />
            )}
          </Box>
          <div>
            <h2>{connection.label || 'Untitled'}</h2>
          </div>
        </Flex>
        <BoxButton className={classes.modifyButton} onClick={handleModify}>
          Modify
        </BoxButton>
      </Flex>
      <div className={classes.connectionInfoContainer}>
        <ConnectionStack
          connection={connection}
          helperClass={classes.addressHelper}
        />
      </div>
    </BoxButton>
  )
}

const ConnectionsList: React.FC<ConnectionsListProps> = ({
  onLaunch,
  onModify,
}) => {
  const [connections] = useConnections()

  return (
    <Flex direction="column" gap={3}>
      {connections.map((connection) => (
        <ConnectionItem
          key={connection.id}
          connection={connection}
          onLaunch={onLaunch}
          onModify={onModify}
        />
      ))}
    </Flex>
  )
}

export default ConnectionsList
