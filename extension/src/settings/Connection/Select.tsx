import React from 'react'
import { VscDebugDisconnect } from 'react-icons/vsc'

import { BoxButton, Button, ConnectionStack, Flex } from '../../components'
import { usePushSettingsRoute } from '../../routing'
import { Connection } from '../../types'
import { useConnection, useConnections } from '../connectionHooks'

import ConnectIcon from './ConnectIcon'
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
          <Flex
            direction="row"
            gap={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex direction="row" gap={2} className={classes.labelContainer}>
              <h3>{connection.label}</h3>

              <div className={classes.status}>
                {connected && (
                  <ConnectIcon
                    size={24}
                    color="green"
                    title="Pilot wallet is connected"
                  />
                )}
                {!connected && !connect && (
                  <VscDebugDisconnect
                    size={24}
                    color="crimson"
                    title="Pilot wallet is not connected"
                  />
                )}
                {!connected && connect && (
                  <ConnectIcon
                    size={24}
                    color="orange"
                    title="Pilot wallet is connected to a different chain"
                  />
                )}
              </div>
            </Flex>

            <ConnectionStack
              connection={connection}
              helperClass={classes.addressHelper}
              addressBoxClass={classes.addressBox}
            />
          </Flex>
        </BoxButton>
        <Button
          onClick={() => {
            pushSettingsRoute(connection.id)
          }}
          className={classes.connectionEdit}
        >
          Modify
        </Button>
      </Flex>
    </div>
  )
}

export default SelectConnection
