import cn from 'classnames'
import React from 'react'

import { MODULE_NAMES } from '../../integrations/zodiac/useZodiacModules'
import { LegacyConnection } from '../../types'
import Address from '../Address'
import Box from '../Box'

import classes from './style.module.css'

import PUBLIC_PATH from '../../publicPath'
import pilotIcon from './pilot-icon.svg'
import targetSafeIcon from './target-safe-icon.svg'
import circleIcon from '../../assets/icons/circle.svg'
import BlockieStack from '../BlockieStack'


interface Props {
  connection: LegacyConnection
  helperClass?: string
  addressBoxClass?: string
  className?: string
}

const ConnectionStack: React.FC<Props> = ({
  connection,
  helperClass,
  addressBoxClass,
  className,
}) => {
  const { avatarAddress, moduleAddress, pilotAddress } = connection
  return (
    <div className={cn(classes.routeStack, className)}>
      <Box className={cn([classes.routeStackContainer, addressBoxClass])} >
        <div className={cn([classes.routeContainer])}>
          <div className={cn([classes.routeIconContainer])}>
            <img src={PUBLIC_PATH + pilotIcon} alt="Pilot Icon" />
          </div>
          <p style={{ textAlign: "start" }}>Pilot</p>
        </div>
        <Address address={pilotAddress} />

        <div className={classes.routeArrowContainer}>

          <img src={PUBLIC_PATH + circleIcon} alt="Dot Icon" />

        </div>
      </Box>
      {moduleAddress && (
        <div className={cn([classes.routeModContainer, classes.grow, addressBoxClass])} >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p>1 connections</p>
            <p className={cn([classes.routesLink])}>View connections</p>
          </div>
          <BlockieStack addresses={[moduleAddress]} />
          <div className={classes.routeModArrowContainer}>
            <img src={PUBLIC_PATH + circleIcon} alt="Dot Icon" />
          </div>

        </div>

      )}
      <Box className={cn([classes.routeStackContainer, addressBoxClass])} >
        <div className={cn([classes.routeContainer])}>
          <div className={cn([classes.routeIconContainer])}>
            <img src={PUBLIC_PATH + targetSafeIcon} alt="Target Safe Icon" />
          </div>
          <p style={{ textAlign: "start" }}>Target Safe</p>
        </div>
        <Address address={avatarAddress} />

      </Box>
    </div>
  )
}

export default ConnectionStack
