import cn from 'classnames'
import React from 'react'

import { Address, Box } from '../components'
import walletConnectLogo from '../settings/ConnectButton/wallet-connect-logo.png'

import safeLogo from './gnosis-safe.png'
import classNames from './index.module.css'
import zodiacLogo from './zodiac.png'

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
        roundedRight
        double
        p={2}
        className={cn(classNames.address, classNames.lastAddress)}
      >
        <Address address={pilotAddress} />
        <div className={classNames.helper}>
          <p>Pilot Account</p>
        </div>
      </Box>

      {!redundant && (
        <Box roundedRight double p={2} className={classNames.address}>
          <Address address={moduleAddress} />
          <div className={classNames.helper}>
            <p>Zodiac Module</p>
          </div>
        </Box>
      )}
      <Box roundedRight double p={2} className={classNames.address}>
        <Address address={avatarAddress} />
        <div className={classNames.helper}>
          <p>DAO Safe</p>
        </div>
      </Box>
    </div>
  )
}

export default AddressStack
