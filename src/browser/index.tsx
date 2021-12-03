import cn from 'classnames'
import React, { useEffect, useState } from 'react'

import { useWalletConnectProvider } from '../WalletConnectProvider'
import { Address, BlockLink, Box, Flex } from '../components'
import { pushLocation, useLocation } from '../location'

import AddressBar from './AddressBar'
import BrowserFrame from './Frame'
import classNames from './index.module.css'

const Browser: React.FC = () => {
  const location = useLocation()

  // When the user browses in the iframe the location will update constantly.
  // This must not trigger an update of the iframe's src prop, though, since that would rerender the iframe.
  const [initialLocation, setInitialLocation] = useState(location)

  const { provider } = useWalletConnectProvider()
  const avatarAddress = localStorage.getItem('avatarAddress')
  const targetAddress = localStorage.getItem('targetAddress')

  const redirectToSettings = !avatarAddress || !targetAddress
  useEffect(() => {
    if (redirectToSettings) {
      pushLocation('settings')
    }
  }, [redirectToSettings])

  if (redirectToSettings) {
    return null
  }

  return (
    <div className={classNames.browser}>
      <div className={classNames.topBar}>
        <Flex gap={3} justifyContent="spaceBetween">
          <Box>
            <Flex gap={1}>
              <Box className={classNames.appName} double>
                Zodiac Pilot
              </Box>
              <Box className={classNames.addressBar} double>
                <AddressBar onSubmit={setInitialLocation} />
              </Box>
            </Flex>
          </Box>
          <BlockLink href={`#${encodeURIComponent(`settings;${location}`)}`}>
            <div className={classNames.addressStack}>
              <Box
                roundedLeft
                double
                p={2}
                className={classNames.addressContainer}
              >
                <Address address={targetAddress} />
              </Box>
              <Box
                roundedLeft
                double
                p={2}
                className={classNames.addressContainer}
              >
                <Address address={avatarAddress} />
              </Box>
              <Box
                roundedLeft
                double
                p={2}
                className={cn(
                  classNames.addressContainer,
                  classNames.lastAddress
                )}
              >
                <Address address={provider.accounts[0]} />
              </Box>
            </div>
          </BlockLink>
        </Flex>
      </div>
      <div className={classNames.main}>
        <Box className={classNames.frame} double p={2}>
          <BrowserFrame
            src={initialLocation}
            avatarAddress={avatarAddress}
            targetAddress={targetAddress}
          />
        </Box>
      </div>
    </div>
  )
}

export default Browser
