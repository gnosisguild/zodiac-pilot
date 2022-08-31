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
  <Box p={2} className={cn({ [classes.collapsed]: !expanded })}>
    <div className={cn(classes.toggleContainer, {[classes.collapsedContainer]: !expanded})}>
      <ToggleButton expanded={expanded} onToggle={onToggle} />
    </div>
    <Flex direction="column" gap={1} className={classes.wrapper}>
      <Flex gap={2} alignItems="center">
        {expanded && header}
      </Flex>
      {expanded && children}
    </Flex>
  </Box>
)

export default Drawer
