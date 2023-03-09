import React from 'react'

import { BoxButton, Button, ConnectionStack, Flex } from '../../components'
import { usePushSettingsRoute } from '../../routing'
import { Connection } from '../../types'
import { useConnection, useConnections } from '../connectionHooks'

import { ConnectedIcon, DisconnectedIcon } from './ConnectIcon'
import classes from './style.module.css'

const SelectConnection: React.FC<{ onLaunch(connectionId: string): void }> = ({
  onLaunch,
}) => {
  const [connections] = useConnections()

  return (
    <Flex direction="column" gap={3}>
      {connections.map((connection) => (
        <ConnectionItem
          key={connection.id}
          connection={connection}
          onLaunch={onLaunch}
        />
      ))}
    </Flex>
  )
}

const ConnectionItem: React.FC<{
  connection: Connection
  onLaunch(connectionId: string): void
}> = ({ connection, onLaunch }) => {
  const { connected, connect } = useConnection(connection.id)
  const pushSettingsRoute = usePushSettingsRoute()

  return (
    <div className={classes.connectionItem}>
      <Flex
        direction="row"
        gap={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <BoxButton
          onClick={async () => {
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

            pushSettingsRoute(connection.id)
          }}
          className={classes.connectionButton}
        >
          <Flex direction="column" gap={4}>
            <Flex
              direction="row"
              gap={2}
              justifyContent="space-between"
              className={classes.labelContainer}
            >
              <Flex direction="row" alignItems="center" gap={3}>
                <div className={classes.status}>
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
                </div>
                <h3>{connection.label}</h3>
              </Flex>

              <Button
                onClick={() => {
                  pushSettingsRoute(connection.id)
                }}
                className={classes.connectionEdit}
              >
                Modify
              </Button>
            </Flex>
            <Flex
              direction="row"
              gap={5}
              alignItems="baseline"
              className={classes.infoContainer}
            >
              <ConnectionStack
                connection={connection}
                helperClass={classes.addressHelper}
                addressBoxClass={classes.addressBox}
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
        </BoxButton>
      </Flex>
    </div>
  )
}

export default SelectConnection
