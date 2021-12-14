import cn from 'classnames'
import React, { ReactNode } from 'react'

import Box from '../Box'
import Flex from '../Flex'

import ToggleButton from './ToggleButton'
import classes from './style.module.css'

interface Props {
  children: ReactNode
  header?: ReactNode
  expanded: boolean
  onToggle(): void
}

const Drawer: React.FC<Props> = ({ children, header, expanded, onToggle }) => (
  <Box p={1} className={cn({ [classes.collapsed]: !expanded })}>
    <Flex gap={1} className={classes.wrapper}>
      <Flex direction="column" gap={1}>
        <ToggleButton expanded={expanded} onToggle={onToggle} />
        {header}
      </Flex>
      {expanded && (
        <>
          <div className={classes.divider} />
          {children}
        </>
      )}
    </Flex>
  </Box>
)

export default Drawer
