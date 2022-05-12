import React, { useEffect, useState } from 'react'

import { BlockLink, Box, Flex } from '../components'
import { AddressStack } from '../components'
import { pushLocation, useLocation } from '../location'
import { ProvideGanache } from '../providers'
import { useConnection } from '../settings'

import Drawer from './Drawer'
import BrowserFrame from './Frame'
import ProvideProvider from './ProvideProvider'
import TransactionStatus from './TransactionStatus'
import UrlInput from './UrlInput'
import classNames from './index.module.css'
import { ProvideState } from './state'

// This disables elastic scroll behavior on Macs
const useNoPageScroll = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])
}

const Browser: React.FC = () => {
  const location = useLocation()
  useNoPageScroll()

  // When the user browses in the iframe the location will update constantly.
  // This must not trigger an update of the iframe's src prop, though, since that would rerender the iframe.
  const [initialLocation, setInitialLocation] = useState(location)

  const { provider } = useConnection()
  const avatarAddress = localStorage.getItem('avatarAddress')
  const moduleAddress = localStorage.getItem('moduleAddress')
  const roleId = localStorage.getItem('roleId')

  const redirectToSettings = !avatarAddress || !moduleAddress || !roleId
  useEffect(() => {
    if (redirectToSettings) {
      pushLocation('settings')
    }
  }, [redirectToSettings])

  if (redirectToSettings) {
    return null
  }

  return (
    // <ProvideGanache>
    <ProvideState>
      <ProvideProvider
        avatarAddress={avatarAddress}
        moduleAddress={moduleAddress}
        roleId={roleId}
        simulate={false}
      >
        <div className={classNames.browser}>
          <div className={classNames.topBar}>
            <Flex gap={3} justifyContent="space-between">
              <Box>
                <Flex gap={1}>
                  <Box className={classNames.appName} double>
                    Zodiac Pilot
                  </Box>
                  <Box double>
                    <UrlInput onSubmit={setInitialLocation} />
                  </Box>
                </Flex>
              </Box>
              <TransactionStatus />
              <BlockLink
                href={`#${encodeURIComponent(`settings;${location}`)}`}
              >
                <AddressStack
                  interactive
                  pilotAddress={provider.accounts[0]}
                  moduleAddress={moduleAddress}
                  avatarAddress={avatarAddress}
                />
              </BlockLink>
            </Flex>
          </div>
          <Flex gap={4} className={classNames.main}>
            <Box className={classNames.frame} double p={2}>
              <BrowserFrame src={initialLocation} />
            </Box>
            {/* <Drawer /> */}
          </Flex>
        </div>
      </ProvideProvider>
    </ProvideState>
    // </ProvideGanache>
  )
}

export default Browser
