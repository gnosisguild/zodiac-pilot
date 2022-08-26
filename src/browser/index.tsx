import React, { useEffect, useState } from 'react'

import { AppPicker, BlockLink, Box, Flex } from '../components'
import { AddressStack } from '../components'
import { pushLocation, useLocation } from '../location'
import { ProvideTenderly } from '../providers'
import { useSettingsHash } from '../routing'
import { useConnection, useTenderly } from '../settings'
import { TenderlyStatus } from '../settings/useTenderly'

import Drawer from './Drawer'
import BrowserFrame from './Frame'
import ProvideProvider from './ProvideProvider'
import TransactionStatus from './TransactionStatus'
import UrlInput from './UrlInput'
import classNames from './index.module.css'
import classes from './index.module.css'
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
  const settingsHash = useSettingsHash()
  const { connection, provider } = useConnection()
  const [, tenderlyStatus] = useTenderly()

  const simulate = tenderlyStatus === TenderlyStatus.SUCCESS

  return (
    <ProvideTenderly>
      <ProvideState>
        <ProvideProvider simulate={simulate}>
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
                <BlockLink href={settingsHash}>
                  <AddressStack
                    interactive
                    pilotAddress={provider.accounts[0]}
                    moduleAddress={connection.moduleAddress}
                    avatarAddress={connection.avatarAddress}
                  />
                </BlockLink>
              </Flex>
            </div>
            <Flex gap={4} className={classNames.main}>
              <Box className={classNames.frame} double p={2}>
                {initialLocation ? (
                  <BrowserFrame src={initialLocation} />
                ) : (
                  <div className={classes.launchPage}>
                    <Box p={3} double>
                      <h2>Choose an app to get started</h2>
                      <AppPicker
                        large
                        onPick={(url) => {
                          pushLocation(url)
                          setInitialLocation(url)
                        }}
                      />
                    </Box>
                  </div>
                )}
              </Box>
              {simulate && <Drawer />}
            </Flex>
          </div>
        </ProvideProvider>
      </ProvideState>
    </ProvideTenderly>
  )
}

export default Browser
