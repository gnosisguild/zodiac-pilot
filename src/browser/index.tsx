import React from 'react'

import { useWalletConnectProvider } from '../WalletConnectProvider'
import { Address, Box, Flex } from '../components'

import AddressBar from './AddressBar'
import BrowserFrame from './Frame'
import classNames from './index.module.css'

const DAO_SAFE = '0x87eb5f76c3785936406fa93654f39b2087fd8068'

const Browser: React.FC = () => {
  const { provider } = useWalletConnectProvider()
  const avatarAddress = DAO_SAFE
  const targetAddress = DAO_SAFE
  return (
    <div className={classNames.browser}>
      <div className={classNames.topBar}>
        <Flex gap={3}>
          <AddressBar />
          <a href="#settings">
            <Box roundedLeft>
              <Address address={provider.accounts[0]} />
            </Box>
          </a>
        </Flex>
      </div>
      <div className={classNames.main}>
        <Box className={classNames.frame} double>
          <BrowserFrame
            avatarAddress={avatarAddress}
            targetAddress={targetAddress}
          />
        </Box>
      </div>
    </div>
  )
}

export default Browser
