import cn from 'classnames'
import React from 'react'

import { Address, Box } from '../components'

import classNames from './index.module.css'

interface Props {
  targetAddress: string
  avatarAddress: string
  connectedAddress: string
}

const AddressStack: React.FC<Props> = ({
  targetAddress,
  avatarAddress,
  connectedAddress,
}) => {
  return (
    <div className={classNames.addressStack}>
      <Box roundedLeft double p={2} className={classNames.address}>
        <Address address={avatarAddress} />
      </Box>
      <Box roundedLeft double p={2} className={classNames.address}>
        <Address address={targetAddress} />
      </Box>
      <Box
        roundedLeft
        double
        p={2}
        className={cn(classNames.address, classNames.lastAddress)}
      >
        <Address address={connectedAddress} />
      </Box>
    </div>
  )
}

export default AddressStack
