import React from 'react'

import { useSettingsHash } from '../../routing'
import { useConnection } from '../../settings'
import BlockLink from '../BlockLink'
import Blockie from '../Blockie'
import Box from '../Box'
import ConnectionStack from '../ConnectionStack'
import Flex from '../Flex'

import ConnectionsIcon from './ConnectionsIcon'
import classes from './style.module.css'

interface ConnectionBubbleProps {
  onConnectionsClick: () => void
}

const ConnectionBubble: React.FC<ConnectionBubbleProps> = ({
  onConnectionsClick,
}) => {
  const { connection } = useConnection()
  const currentConnectionHash = useSettingsHash(connection.id)
  return (
    <Box rounded>
      <Flex gap={1}>
        <BlockLink href={currentConnectionHash}>
          <Box bg roundedLeft className={classes.currentConnectionContainer}>
            <Flex justifyContent="space-between" alignItems="center" gap={3}>
              <div className={classes.blockieStack}>
                <Box rounded className={classes.blockieBox}>
                  <Blockie
                    address={connection.pilotAddress}
                    className={classes.blockie}
                  />
                </Box>
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
            <div className={classes.infoContainer}>
              <Box bg rounded p={3} className={classes.info}>
                <ConnectionStack connection={connection} />
              </Box>
            </div>
          </Box>
        </BlockLink>
        <BlockLink onClick={onConnectionsClick}>
          <Box bg roundedRight className={classes.connectionsContainer}>
            <ConnectionsIcon width="42" height="42" />
          </Box>
        </BlockLink>
      </Flex>
    </Box>
  )
}

export default ConnectionBubble
