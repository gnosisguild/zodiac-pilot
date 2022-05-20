import React from 'react'

import { Box, Flex } from '../components'

import Connection from './Connection'
import {
  ProvideConnections,
  useConnection,
  useSelectConnection,
} from './connectionHooks'
import classes from './style.module.css'

export { useConnection, ProvideConnections }

type Props = {
  url: string
  onLaunch(url: string): void
  editConnectionId?: string
}

const Settings: React.FC<Props> = ({ url, onLaunch, editConnectionId }) => {
  const selectConnection = useSelectConnection()
  return (
    <div className={classes.container}>
      <Box double p={3} className={classes.header}>
        <h1>Zodiac Pilot</h1>
        <Box double p={3}>
          <p>Control a Safe via a Zodiac mod from an enabled account.</p>
        </Box>
      </Box>
      <Box double p={3}>
        <Flex direction="column" gap={3}>
          <Connection
            editConnectionId={editConnectionId}
            onLaunch={(connectionId) => {
              selectConnection(connectionId)
              onLaunch(url)
            }}
          />
        </Flex>
      </Box>
    </div>
  )
}

export default Settings
