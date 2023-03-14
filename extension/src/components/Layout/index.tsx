import classNames from 'classnames'
import React from 'react'

import { usePushConnectionsRoute } from '../../routing'
import Box from '../Box'
import Button from '../Button'
import Flex from '../Flex'

import classes from './Layout.module.css'

interface Props {
  children: React.ReactNode
  headerRight: React.ReactNode
  navBox: React.ReactNode
  navFullWidth?: boolean
}

const Layout: React.FC<Props> = ({
  children,
  headerRight,
  navBox,
  navFullWidth = false,
}) => {
  const pushConnections = usePushConnectionsRoute()
  return (
    <div className={classes.page}>
      <div className={classes.topBar}>
        <Flex gap={4} justifyContent="space-between" alignItems="center">
          <Box
            className={classNames({
              [classes.fullWidthNavContainer]: navFullWidth,
            })}
          >
            <Flex
              gap={1}
              className={classNames({ [classes.fullWidthNav]: navFullWidth })}
            >
              <Button
                className={classes.appName}
                onClick={() => pushConnections('')}
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
