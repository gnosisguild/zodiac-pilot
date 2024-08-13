import cn from 'classnames'
import React from 'react'

import { LegacyConnection } from '../../types'
import Address from '../Address'
import Box from '../Box'
import Flex from '../Flex'

import classes from './style.module.css'

import circleIcon from '../../assets/icons/circle.svg'
import BlockieStack from '../BlockieStack'
import RouteBadgeIcon from '../RouteBadgeIcon'
import PUBLIC_PATH from '../../publicPath'

interface Props {
  connection: LegacyConnection
  helperClass?: string
  addressBoxClass?: string
  className?: string
}

const ConnectionStack: React.FC<Props> = ({
  connection,
  addressBoxClass,
  className,
}) => {
  const { avatarAddress, moduleAddress, pilotAddress } = connection
  return (
    <div className={cn(classes.routeStack, className)}>
      <Box className={cn([classes.routeStackContainer, addressBoxClass])}>
        <RouteBadgeIcon badgeType="pilot" label="Pilot" />

        <Address address={pilotAddress} />

        <div className={classes.routeArrowContainer}>
          <img src={PUBLIC_PATH + circleIcon} alt="Dot Icon" />
        </div>
      </Box>
      {/* To Do: Hook up with real data */}
      {/* {moduleAddress && ( */}
      {true && (
        <Flex gap={0} style={{flexGrow: 1, overflow: "hidden", position: 'relative'}}>
          <p className={classes.connectionsLabel}>4 connections</p>
          <div
            className={cn([
              classes.routeModContainer,
              classes.grow,
              addressBoxClass,
              ])}
          >

              <Flex className={classes.connectionsContainer} gap={1} alignItems='end' style={{flexGrow: 1}} >
                <Box className={cn([classes.routeStackContainer, addressBoxClass])}>
                  <Flex gap={1} direction="column">
                    <p style={{ textAlign: 'start', lineHeight: 1 }}>{"Connection #1"}</p>
                    <Address address={avatarAddress} />
                    <div className={classes.routeModArrowContainer}>
                      <img src={PUBLIC_PATH + circleIcon} alt="Dot Icon" />
                    </div>
                  </Flex>
                </Box>
                <Box className={cn([classes.routeStackContainer, addressBoxClass])}>
                  <Flex gap={1} direction="column">
                    <p style={{ textAlign: 'start', lineHeight: 1 }}>{"Connection #2"}</p>
                    <Address address={avatarAddress} />
                    <div className={classes.routeModArrowContainer}>
                      <img src={PUBLIC_PATH + circleIcon} alt="Dot Icon" />
                    </div>
                  </Flex>
                </Box>
                <Box className={cn([classes.routeStackContainer, addressBoxClass])}>
                  <Flex gap={1} direction="column">
                    <p style={{ textAlign: 'start', lineHeight: 1 }}>{"Connection #3"}</p>
                    <Address address={avatarAddress} />
                    <div className={classes.routeModArrowContainer}>
                      <img src={PUBLIC_PATH + circleIcon} alt="Dot Icon" />
                    </div>
                  </Flex>
                </Box>
                <Box className={cn([classes.routeStackContainer, addressBoxClass])}>
                  <Flex gap={1} direction="column">
                    <p style={{ textAlign: 'start', lineHeight: 1 }}>{"Connection #4"}</p>
                    <Address address={avatarAddress} />
                    <div className={classes.routeModArrowContainer}>
                      <img src={PUBLIC_PATH + circleIcon} alt="Dot Icon" />
                    </div>
                  </Flex>
                </Box>
              </Flex>
          </div>
      </Flex>
      )}
      <Box className={cn([classes.routeStackContainer, addressBoxClass])}>
        <RouteBadgeIcon badgeType="target" label="Target Safe" />
        <Address address={avatarAddress} />
      </Box>
    </div>
  )
}

export default ConnectionStack
