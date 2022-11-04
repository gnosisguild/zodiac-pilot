import React from 'react'

import { usePushSettingsRoute } from '../../routing'
import Box from '../Box'
import Flex from '../Flex'

import classes from './Layout.module.css'

interface Props {
  children: React.ReactNode
  headerRight: React.ReactNode
  navBox: React.ReactNode
}

const Layout: React.FC<Props> = ({ children, headerRight, navBox }) => {
  return (
    <div className={classes.page}>
      <div className={classes.topBar}>
        <Flex gap={3} justifyContent="space-between">
          <Box>
            <Flex gap={1}>
              <Box className={classes.appName} double>
                Zodiac Pilot
              </Box>
              <Box>{navBox}</Box>
            </Flex>
          </Box>
          {headerRight}
        </Flex>
      </div>
      <Flex gap={4} className={classes.main}>
        {children}
      </Flex>
    </div>
  )
}

export default Layout
