import React from 'react'
import { RiBallPenLine } from 'react-icons/ri'
import { VscDebugDisconnect } from 'react-icons/vsc'

import { AddressStack, BoxButton, Flex } from '../../components'
import { usePushSettingsRoute } from '../../routing'
import { Connection } from '../../types'
import { useConnection, useConnections } from '../connectionHooks'
import useConnectionDryRun from '../useConnectionDryRun'

import ConnectIcon from './ConnectIcon'
import classes from './style.module.css'

const SelectConnection: React.FC<{ onLaunch(connectionId: string): void }> = ({
  onLaunch,
}) => {
  const [connections] = useConnections()

  return (
    <Flex direction="column" gap={2}>
      <h2>Safe Connections</h2>
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
  const { connected } = useConnection(connection.id)
  const pushSettingsRoute = usePushSettingsRoute()
  const error = useConnectionDryRun(connection)

  return (
    <div className={classes.connectionItem}>
      <BoxButton
        onClick={() => {
          if (connected && !error) {
            onLaunch(connection.id)
          } else {
            pushSettingsRoute(connection.id)
          }
        }}
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
          avatarAddress={connection.avatarAddress}
          moduleAddress={connection.moduleAddress}
          pilotAddress={connection.pilotAddress}
          helperClass={classes.addressHelper}
          addressBoxClass={classes.addressBox}
        />
      </BoxButton>
      <BoxButton
        onClick={() => {
          pushSettingsRoute(connection.id)
        }}
        className={classes.connectionEdit}
      >
        <RiBallPenLine size={16} />
        <p>Edit</p>
      </BoxButton>
    </div>
  )
}

export default SelectConnection
