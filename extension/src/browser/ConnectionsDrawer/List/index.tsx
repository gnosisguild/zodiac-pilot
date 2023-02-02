import { nanoid } from 'nanoid'
import React from 'react'
import Moment from 'react-moment'

import {
  Box,
  BoxButton,
  Button,
  ConnectionStack,
  Flex,
} from '../../../components'
import { usePushConnectionsRoute } from '../../../routing'
import {
  ConnectedIcon,
  DisconnectedIcon,
} from '../../../settings/Connection/ConnectIcon'
import {
  useConnection,
  useConnections,
  useSelectedConnectionId,
} from '../../../settings/connectionHooks'
import { Connection, ProviderType } from '../../../types'

import classes from './style.module.css'

interface ConnectionsListProps {
  onLaunched: () => void
}

interface ConnectionItemProps {
  connection: Connection
  onLaunch: (connectionId: string) => void
  onModify: (connectionId: string) => void
}

const ConnectionItem: React.FC<ConnectionItemProps> = ({
  onLaunch,
  onModify,
  connection,
}) => {
  const { connected, connect } = useConnection(connection.id)

  const handleModify = () => onModify(connection.id)
  const handleLaunch = async () => {
    if (connected) {
      onLaunch(connection.id)
      return
    }

    if (!connected && connect) {
      const success = await connect()
      if (success) {
        onLaunch(connection.id)
        return
      }
    }

    handleModify()
  }

  return (
    <div className={classes.connection}>
      <BoxButton
        className={classes.connectionItemContainer}
        onClick={handleLaunch}
      >
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
          </Flex>
          <Flex
            direction="row"
            gap={4}
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
              <div className={classes.infoDatum}>
                {connection.lastUsed ? (
                  <Moment unix fromNow>
                    {connection.lastUsed}
                  </Moment>
                ) : (
                  <>N/A</>
                )}
              </div>
              <div className={classes.infoLabel}>Last Used</div>
            </Flex>
          </Flex>
        </Flex>
      </BoxButton>
      <BoxButton onClick={handleModify} className={classes.modifyButton}>
        Modify
      </BoxButton>
    </div>
  )
}

const ConnectionsList: React.FC<ConnectionsListProps> = ({ onLaunched }) => {
  const [, selectConnection] = useSelectedConnectionId()
  const [connections, setConnections] = useConnections()
  const pushConnectionsRoute = usePushConnectionsRoute()

  const handleLaunch = (connectionId: string) => {
    selectConnection(connectionId)
    onLaunched()
  }
  const handleModify = (connectionId: string) => {
    pushConnectionsRoute(connectionId)
  }

  const handleCreate = () => {
    const id = nanoid()
    setConnections([
      ...connections,
      {
        id,
        label: '',
        chainId: 1,
        moduleAddress: '',
        avatarAddress: '',
        pilotAddress: '',
        providerType: ProviderType.WalletConnect,
        moduleType: undefined,
        roleId: '',
      },
    ])
    pushConnectionsRoute(id)
  }

  return (
    <Flex gap={4} direction="column">
      <Flex gap={2} direction="column">
        <Flex gap={1} justifyContent="space-between" alignItems="baseline">
          <h2>Pilot Connections</h2>
          <Button onClick={handleCreate} className={classes.addConnection}>
            Add Connection
          </Button>
        </Flex>
        <hr />
      </Flex>
      {connections.map((connection) => (
        <ConnectionItem
          key={connection.id}
          connection={connection}
          onLaunch={handleLaunch}
          onModify={handleModify}
        />
      ))}
    </Flex>
  )
}

export default ConnectionsList
