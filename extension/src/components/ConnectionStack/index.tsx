import cn from 'classnames'
import React from 'react'

import { LegacyConnection } from '../../types'
import Address from '../Address'
import Box from '../Box'

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
      {moduleAddress && (
        <div
          className={cn([
            classes.routeModContainer,
            classes.grow,
            addressBoxClass,
          ])}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p>1 connections</p>
            <p className={cn([classes.routesLink])}>View connections</p>
          </div>
          <BlockieStack addresses={[moduleAddress]} />
          <div className={classes.routeModArrowContainer}>
            <img src={PUBLIC_PATH + circleIcon} alt="Dot Icon" />
          </div>
        </div>
      )}
      <Box className={cn([classes.routeStackContainer, addressBoxClass])}>
        <RouteBadgeIcon badgeType="target" label="Target Safe" />
        <Address address={avatarAddress} />
      </Box>
    </div>
  )
}

export default ConnectionStack
