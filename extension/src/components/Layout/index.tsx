import React from 'react'

import { usePushSettingsRoute } from '../../routing'
import Box from '../Box'
import Button from '../Button'
import Flex from '../Flex'

import classes from './Layout.module.css'

interface Props {
  children: React.ReactNode
  headerRight: React.ReactNode
  navBox: React.ReactNode
}

const Layout: React.FC<Props> = ({ children, headerRight, navBox }) => {
  const pushSettingsRoute = usePushSettingsRoute()
  return (
    <div className={classes.page}>
      <div className={classes.topBar}>
        <Flex gap={3} justifyContent="space-between" alignItems="center">
          <Box>
            <Flex gap={1}>
              <Button
                className={classes.appName}
                onClick={() => pushSettingsRoute('')}
              >
                Zodiac Pilot
              </Button>
              {navBox}
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
