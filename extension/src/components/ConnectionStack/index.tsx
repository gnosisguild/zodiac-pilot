import cn from 'classnames'
import React from 'react'

import { MODULE_NAMES } from '../../settings/Connection/useZodiacModules'
import { Connection } from '../../types'
import Address from '../Address'
import Box from '../Box'

import classes from './style.module.css'

interface Props {
  connection: Connection
  helperClass?: string
  staticLabels?: boolean
  addressBoxClass?: string
}

const ConnectionStack: React.FC<Props> = ({
  connection,
  helperClass,
  staticLabels = false,
  addressBoxClass,
}) => {
  const { avatarAddress, moduleAddress, pilotAddress, moduleType } = connection

  return (
    <div
      className={cn(classes.connectionStack, {
        [classes.staticLabels]: staticLabels,
      })}
    >
      <Box
        rounded
        double
        p={2}
        className={cn([classes.address, addressBoxClass])}
      >
        <Address address={pilotAddress} />
        {pilotAddress && (
          <div className={cn(classes.helper, helperClass)}>
            <p>Pilot Account</p>
          </div>
        )}
      </Box>

      {moduleAddress && (
        <Box
          roundedRight
          double
          p={2}
          className={cn([classes.address, addressBoxClass])}
        >
          <Address address={moduleAddress} />
          <div className={cn(classes.helper, helperClass)}>
            <p>{(moduleType && MODULE_NAMES[moduleType]) || 'Zodiac'} Mod</p>
          </div>
        </Box>
      )}
      <Box
        roundedRight
        double
        p={2}
        className={cn([classes.address, addressBoxClass])}
      >
        <Address address={avatarAddress} />
        {avatarAddress && (
          <div className={cn(classes.helper, helperClass)}>
            <p>Piloted Safe</p>
          </div>
        )}
      </Box>
    </div>
  )
}

export default ConnectionStack
