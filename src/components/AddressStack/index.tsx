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
  helperClass?: string
  addressBoxClass?: string
}

const AddressStack: React.FC<Props> = ({
  avatarAddress,
  moduleAddress,
  pilotAddress,
  interactive,
  helperClass,
  addressBoxClass,
}) => {
  const redundant = avatarAddress === moduleAddress

  return (
    <div
      className={cn(classes.addressStack, interactive && classes.interactive)}
    >
      <Box
        roundedRight
        double
        p={2}
        classNames={[classes.address, addressBoxClass]}
      >
        <Address address={pilotAddress} />
        {pilotAddress && (
          <div className={cn(classes.helper, helperClass)}>
            <p>Pilot Account</p>
          </div>
        )}
      </Box>

      {!redundant && (
        <Box
          roundedRight
          double
          p={2}
          classNames={[classes.address, addressBoxClass]}
        >
          <Address address={moduleAddress} />
          {moduleAddress && (
            <div className={cn(classes.helper, helperClass)}>
              <p>Zodiac Module</p>
            </div>
          )}
        </Box>
      )}
      <Box
        roundedRight
        double
        p={2}
        classNames={[classes.address, addressBoxClass]}
      >
        <Address address={avatarAddress} />
        {avatarAddress && (
          <div className={cn(classes.helper, helperClass)}>
            <p>DAO Safe</p>
          </div>
        )}
      </Box>
    </div>
  )
}

export default AddressStack
