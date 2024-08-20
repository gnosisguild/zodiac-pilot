import React from 'react'

import { useConnectionsHash } from '../../routing'
import { useRoute } from '../../panel/routes'
import BlockLink from '../BlockLink'
import Blockie from '../Blockie'
import Box from '../Box'
import ConnectionStack from '../ConnectionStack'
import Flex from '../Flex'

import ConnectionsIcon from './ConnectionsIcon'
import classes from './style.module.css'
import { asLegacyConnection } from '../../panel/routes/legacyConnectionMigrations'

interface ConnectionBubbleProps {
  onConnectionsClick: () => void
}

const ConnectionBubble: React.FC<ConnectionBubbleProps> = ({
  onConnectionsClick,
}) => {
  const { route } = useRoute()
  const connection = asLegacyConnection(route)
  const currentConnectionHash = useConnectionsHash(route.id)
  return (
    <Box roundedLeft className={classes.connectionBubble}>
      <BlockLink onClick={onConnectionsClick}>
        <Flex gap={1}>
          <Box bg roundedLeft className={classes.currentConnectionContainer}>
            <Flex justifyContent="space-between" alignItems="center" gap={3}>
              <div className={classes.blockieStack}>
                {connection.pilotAddress && (
                  <Box rounded className={classes.blockieBox}>
                    <Blockie
                      address={connection.pilotAddress}
                      className={classes.blockie}
                    />
                  </Box>
                )}
                {connection.moduleAddress && (
                  <Box rounded className={classes.blockieBox}>
                    <Blockie
                      address={connection.moduleAddress}
                      className={classes.blockie}
                    />
                  </Box>
                )}
                <Box rounded className={classes.blockieBox}>
                  <Blockie
                    address={connection.avatarAddress}
                    className={classes.blockie}
                  />
                </Box>
              </div>
              <p className={classes.label}>{connection.label}</p>
            </Flex>
          </Box>
          <Box bg className={classes.connectionsContainer}>
            <ConnectionsIcon height="100%" width="100%" />
          </Box>
        </Flex>
      </BlockLink>
      <div className={classes.infoContainer}>
        <Box bg p={3} className={classes.info}>
          <BlockLink href={currentConnectionHash}>
            <ConnectionStack
              connection={connection}
              className={classes.stack}
            />
          </BlockLink>
        </Box>
      </div>
    </Box>
  )
}

export default ConnectionBubble
