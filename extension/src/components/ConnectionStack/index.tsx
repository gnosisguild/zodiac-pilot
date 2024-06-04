import cn from 'classnames'
import React from 'react'

import { MODULE_NAMES } from '../../integrations/zodiac/useZodiacModules'
import { Connection } from '../../types'
import Address from '../Address'
import Box from '../Box'

import classes from './style.module.css'

interface Props {
  connection: Connection
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
  const { avatarAddress, moduleAddress, pilotAddress, moduleType } = connection
  return (
    <div className={cn(classes.connectionStack, className)}>
      <Box rounded className={cn([classes.address, addressBoxClass])}>
        <Address address={pilotAddress} />

        <div className={cn(classes.helper, helperClass)}>
          <p>Pilot Account</p>
        </div>
      </Box>
      {moduleAddress && (
        <Box roundedRight className={cn([classes.address, addressBoxClass])}>
          <Address address={moduleAddress} />
          <div className={cn(classes.helper, helperClass)}>
            <p>{(moduleType && MODULE_NAMES[moduleType]) || 'Zodiac'} Mod</p>
          </div>
        </Box>
      )}
      <Box roundedRight className={cn([classes.address, addressBoxClass])}>
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
