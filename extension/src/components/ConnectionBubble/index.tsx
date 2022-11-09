import React from 'react'

import { useSettingsHash } from '../../routing'
import { useConnection } from '../../settings'
import AddressStack from '../AddressStack'
import BlockLink from '../BlockLink'
import Blockie from '../Blockie'
import Box from '../Box'
import Flex from '../Flex'

import classes from './style.module.css'

const ConnectionBubble: React.FC = () => {
  const { connection } = useConnection()
  const settingsHash = useSettingsHash(connection.id)
  return (
    <BlockLink href={settingsHash}>
      <Box double bg rounded className={classes.container}>
        <Flex justifyContent="space-between" alignItems="center" gap={3}>
          <div className={classes.blockieStack}>
            <Box rounded className={classes.blockieBox}>
              <Blockie
                address={connection.pilotAddress}
                className={classes.blockie}
              />
            </Box>
            <Box rounded className={classes.blockieBox}>
              <Blockie
                address={connection.moduleAddress}
                className={classes.blockie}
              />
            </Box>
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
            <AddressStack
              staticLabels
              pilotAddress={connection.pilotAddress}
              moduleAddress={connection.moduleAddress}
              avatarAddress={connection.avatarAddress}
            />
          </Box>
        </div>
      </Box>
    </BlockLink>
  )
}

export default ConnectionBubble
