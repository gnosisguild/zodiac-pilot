import React from 'react'
import { VscDebugDisconnect } from 'react-icons/vsc'

import { AddressStack, BlockButton, Box, Flex } from '../../components'
import { useWalletConnectProvider } from '../../providers'
import { Connection } from '../../types'
import {
  useConnection,
  useConnections,
  useSelectConnection,
} from '../connectionHooks'

const SelectConnection: React.FC = () => {
  const [connections] = useConnections()

  return (
    <Flex direction="column" gap={1}>
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
  const selectConnection = useSelectConnection()
  const { connection: selectedConnection } = useConnection()

  return (
    <BlockButton onClick={() => selectConnection(connection.id)}>
      <Box double={selectedConnection === connection}>
        {connection.label}
        <Flex direction="row" gap={1}>
          <AddressStack
            avatarAddress={connection.avatarAddress}
            moduleAddress={connection.moduleAddress}
            pilotAddress={provider.accounts[0] || ''}
          />
          {!connected && <VscDebugDisconnect size={24} color="crimson" />}
        </Flex>
      </Box>
    </BlockButton>
  )
}

export default SelectConnection
