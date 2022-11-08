import React, { useEffect, useState } from 'react'

import { AppPicker, BlockLink, Box } from '../components'
import { AddressStack } from '../components'
import ConnectionBubble from '../components/ConnectionBubble'
import Layout from '../components/Layout'
import { pushLocation, useLocation } from '../location'
import { ProvideTenderly } from '../providers'
import { useSettingsHash } from '../routing'
import { useConnection } from '../settings'

import Drawer from './Drawer'
import BrowserFrame from './Frame'
import ProvideProvider from './ProvideProvider'
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

  return (
    <ProvideTenderly>
      <ProvideState>
        <ProvideProvider simulate>
          <Layout
            navBox={<UrlInput onSubmit={setInitialLocation} />}
            navFullWidth
            headerRight={<ConnectionBubble />}
          >
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
            <Drawer />
          </Layout>
        </ProvideProvider>
      </ProvideState>
    </ProvideTenderly>
  )
}

export default Browser
