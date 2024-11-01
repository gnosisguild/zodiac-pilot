import { getChainId } from '@/chains'
import { Blockie, Box, ConnectionStack } from '@/components'
import { useZodiacRoute } from '@/zodiac-routes'
import React from 'react'
import { Link } from 'react-router-dom'
import { asLegacyConnection } from '../../legacyConnectionMigrations'
import { ConnectionsIcon } from './ConnectionsIcon'
import classes from './style.module.css'

export const RouteBubble: React.FC = () => {
  const route = useZodiacRoute()
  const chainId = getChainId(route.avatar)
  const connection = asLegacyConnection(route)

  return (
    <Box rounded className={classes.routeBubble}>
      <div className="flex gap-1">
        <Box bg roundedLeft className="flex-1 py-0 pl-0 pr-8">
          <Link to={'/routes/' + route.id}>
            <div className="flex items-center gap-2">
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
            </div>
          </Link>
        </Box>
        <Link to="/routes">
          <Box bg roundedRight className={classes.connectionsContainer}>
            <span className="sr-only">Configure routes</span>
            <ConnectionsIcon height="100%" width="100%" />
          </Box>
        </Link>
      </div>

      <div className={classes.infoContainer}>
        <Box bg p={3} className={classes.info}>
          <Link to={'/routes/' + connection.id}>
            <ConnectionStack
              chainId={chainId}
              connection={connection}
              className={classes.stack}
            />
          </Link>
        </Box>
      </div>
    </Box>
  )
}
