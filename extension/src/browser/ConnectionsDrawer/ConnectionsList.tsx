import React from 'react'

import { Box, BoxButton, ConnectionStack, Flex } from '../../components'
import {
  ConnectedIcon,
  DisconnectedIcon,
} from '../../settings/Connection/ConnectIcon'
import { useConnection, useConnections } from '../../settings/connectionHooks'
import { Connection } from '../../types'

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
    <Box className={classes.connectionItemContainer}>
      <Flex direction="column" gap={4}>
        <Flex
          direction="row"
          gap={2}
          justifyContent="space-between"
          className={classes.labelContainer}
        >
          <Flex direction="row" alignItems="center" gap={3}>
            <Box className={classes.connectionIcon}>
              {connected && (
                <ConnectedIcon
                  role="status"
                  size={24}
                  color="green"
                  title="Pilot wallet is connected"
                />
              )}
              {!connected && !connect && (
                <DisconnectedIcon
                  role="status"
                  size={24}
                  color="crimson"
                  title="Pilot wallet is not connected"
                />
              )}
              {!connected && connect && (
                <ConnectedIcon
                  role="status"
                  size={24}
                  color="orange"
                  title="Pilot wallet is connected to a different chain"
                />
              )}
            </Box>
            <h2>{connection.label}</h2>
          </Flex>
          <Flex gap={3}>
            <BoxButton
              onClick={handleLaunch}
              className={classes.connectionButton}
            >
              Connect
            </BoxButton>
            <BoxButton
              onClick={handleModify}
              className={classes.connectionButton}
            >
              Modify
            </BoxButton>
          </Flex>
        </Flex>
        <Flex
          direction="row"
          gap={5}
          alignItems="baseline"
          className={classes.infoContainer}
        >
          <ConnectionStack
            connection={connection}
            addressBoxClass={classes.addressBox}
            className={classes.connectionStack}
          />
          <Flex
            direction="column"
            alignItems="start"
            gap={2}
            className={classes.info}
          >
            <div className={classes.infoDatum}>STUB DAYS AGO</div>
            <div className={classes.infoLabel}>Last Used</div>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}

const ConnectionsList: React.FC<ConnectionsListProps> = ({
  onLaunch,
  onModify,
}) => {
  const [connections] = useConnections()

  return (
    <>
      {connections.map((connection) => (
        <ConnectionItem
          key={connection.id}
          connection={connection}
          onLaunch={onLaunch}
          onModify={onModify}
        />
      ))}
    </>
  )
}

export default ConnectionsList
