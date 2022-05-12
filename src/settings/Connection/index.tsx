import { nanoid } from 'nanoid'
import React from 'react'

import { Box, Button, Flex } from '../../components'
import { useConnections, useSelectConnection } from '../connectionHooks'

import EditConnection from './Edit'
import SelectConnection from './Select'

const Connection: React.FC = () => {
  const [connections, setConnections] = useConnections()
  const selectConnection = useSelectConnection()

  return (
    <Flex direction="column" gap={3}>
      <Box p={3}>
        <SelectConnection />
        <Button
          onClick={() => {
            const id = nanoid()
            setConnections([
              ...connections,
              {
                id,
                label: '',
                avatarAddress: '',
                moduleAddress: '',
                roleId: '',
              },
            ])
            selectConnection(id)
          }}
        >
          Add connection
        </Button>
      </Box>
      <Box p={3}>
        <EditConnection />
      </Box>
    </Flex>
  )
}

export default Connection
