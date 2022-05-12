import React from 'react'

import { Box, Button, Flex } from '../components'

import Connection from './Connection'
import { ProvideConnections, useConnection } from './connectionHooks'
import classes from './style.module.css'
import useConnectionDryRun from './useConnectionDryRun'

export { useConnection, ProvideConnections }

type Props = {
  url: string
  onLaunch(url: string): void
}

const Settings: React.FC<Props> = ({ url, onLaunch }) => {
  const { connection, connected } = useConnection()

  const error = useConnectionDryRun(connection)

  const canLaunch =
    connected &&
    !error &&
    connection.moduleAddress &&
    connection.avatarAddress &&
    connection.roleId

  return (
    <div className={classes.container}>
      <h1>Zodiac Pilot</h1>

      <Box double p={3}>
        <Flex direction="column" gap={3}>
          <Box p={3}>
            <p>
              This app allows you to control a Safe via a Zodiac mod from an
              enabled account.
            </p>
          </Box>

          <Connection />

          {error && (
            <>
              <div>There seems to be a problem with this connection:</div>
              <Box p={3} className={classes.error}>
                {error}
              </Box>
            </>
          )}

          <Button
            disabled={!canLaunch}
            onClick={() => {
              onLaunch(url)
            }}
          >
            Launch
          </Button>
        </Flex>
      </Box>
    </div>
  )
}

export default Settings
