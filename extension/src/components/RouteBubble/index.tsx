import React from 'react'
import { Link } from 'react-router-dom'
import { useRoute } from '../../panel/routes'
import { asLegacyConnection } from '../../panel/routes/legacyConnectionMigrations'
import { Blockie } from '../Blockie'
import Box from '../Box'
import ConnectionStack from '../ConnectionStack'
import Flex from '../Flex'
import ConnectionsIcon from './ConnectionsIcon'
import classes from './style.module.css'

export const RouteBubble: React.FC = () => {
  const { route } = useRoute()
  const connection = asLegacyConnection(route)

  return (
    <Box roundedLeft className={classes.routeBubble}>
      <Flex gap={1}>
        <Box bg roundedLeft className={classes.currentConnectionContainer}>
          <Link to={'/routes/' + route.id}>
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
          </Link>
        </Box>
        <Link to="/routes">
          <Box bg className={classes.connectionsContainer}>
            <span className="sr-only">Configure routes</span>
            <ConnectionsIcon height="100%" width="100%" />
          </Box>
        </Link>
      </Flex>

      <div className={classes.infoContainer}>
        <Box bg p={3} className={classes.info}>
          <Link to={'/routes/' + connection.id}>
            <ConnectionStack
              connection={connection}
              className={classes.stack}
            />
          </Link>
        </Box>
      </div>
    </Box>
  )
}
