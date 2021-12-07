import cn from 'classnames'
import React from 'react'

import { Address, Box } from '../components'

import classNames from './index.module.css'

interface Props {
  avatarAddress: string
  moduleAddress: string
  pilotAddress: string
}

const AddressStack: React.FC<Props> = ({
  avatarAddress,
  moduleAddress,
  pilotAddress,
}) => {
  const redundant = avatarAddress === moduleAddress

  return (
    <div className={classNames.addressStack}>
      <Box
        rounded
        double
        p={2}
        className={cn(classNames.address, classNames.lastAddress)}
      >
        <Address address={pilotAddress} />
      </Box>

      {!redundant && (
        <Box roundedLeft double p={2} className={classNames.address}>
          <Address address={moduleAddress} />
        </Box>
      )}
      <Box roundedLeft double p={2} className={classNames.address}>
        <Address address={avatarAddress} />
      </Box>
    </div>
  )
}

export default AddressStack
