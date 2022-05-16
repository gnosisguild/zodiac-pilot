import React from 'react'
import { VscDebugDisconnect } from 'react-icons/vsc'

import { AddressStack, BlockButton, Box, Flex } from '../../components'
import { useWalletConnectProvider } from '../../providers'
import { Connection } from '../../types'
import { useConnections, useSelectedConnectionId } from '../connectionHooks'

import classes from './style.module.css'

const SelectConnection: React.FC = () => {
  const [connections] = useConnections()

  return (
    <Flex direction="column" gap={2}>
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
    <BlockButton onClick={() => setSelectedConnectionId(connection.id)}>
      <Flex direction="row" gap={2} alignItems="center">
        <AddressStack
          avatarAddress={connection.avatarAddress}
          moduleAddress={connection.moduleAddress}
          pilotAddress={provider.accounts[0] || ''}
        />
        {connection.label}
        {!connected && (
          <div className={classes.status}>
            <VscDebugDisconnect
              size={24}
              color="crimson"
              title="WalletConnect is not connected"
            />
          </div>
        )}
      </Flex>
    </BlockButton>
  )
}

export default SelectConnection
