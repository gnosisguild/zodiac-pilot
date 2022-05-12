import cn from 'classnames'
import React from 'react'

import Address from '../Address'
import Box from '../Box'

import classes from './style.module.css'

interface Props {
  avatarAddress: string
  moduleAddress: string
  pilotAddress: string
  interactive?: boolean
}

const AddressStack: React.FC<Props> = ({
  avatarAddress,
  moduleAddress,
  pilotAddress,
  interactive,
}) => {
  const redundant = avatarAddress === moduleAddress

  return (
    <div className={cn(classes.addressStack, { interactive })}>
      <Box roundedRight double p={2} className={classes.address}>
        <Address address={pilotAddress} />
        <div className={classes.helper}>
          <p>Pilot Account</p>
        </div>
      </Box>

      {!redundant && (
        <Box roundedRight double p={2} className={classes.address}>
          <Address address={moduleAddress} />
          <div className={classes.helper}>
            <p>Zodiac Module</p>
          </div>
        </Box>
      )}
      <Box roundedRight double p={2} className={classes.address}>
        <Address address={avatarAddress} />
        <div className={classes.helper}>
          <p>DAO Safe</p>
        </div>
      </Box>
    </div>
  )
}

export default AddressStack
