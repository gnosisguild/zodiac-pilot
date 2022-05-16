import React from 'react'

import { Box, Flex } from '../components'

import Connection from './Connection'
import { ProvideConnections, useConnection } from './connectionHooks'
import classes from './style.module.css'

export { useConnection, ProvideConnections }

type Props = {
  url: string
  onLaunch(url: string): void
}

const Settings: React.FC<Props> = ({ url, onLaunch }) => {
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

          <Connection
            onLaunch={() => {
              onLaunch(url)
            }}
          />
        </Flex>
      </Box>
    </div>
  )
}

export default Settings
