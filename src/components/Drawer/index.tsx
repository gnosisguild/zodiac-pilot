import cn from 'classnames'
import React, { ReactNode } from 'react'

import Box from '../Box'
import Flex from '../Flex'

import ToggleButton from './ToggleButton'
import classes from './style.module.css'

interface Props {
  children: ReactNode
  header?: ReactNode
  collapsedChildren?: ReactNode
  expanded: boolean
  onToggle(): void
}

const Drawer: React.FC<Props> = ({
  children,
  header,
  expanded,
  onToggle,
  collapsedChildren,
}) => (
  <button
    onClick={onToggle}
    disabled={expanded}
    className={cn(classes.wrapperButton, { [classes.collapsed]: !expanded })}
  >
    <Box p={2} className={classes.box}>
      <div
        className={cn(classes.toggleContainer, {
          [classes.collapsedContainer]: !expanded,
        })}
      >
        <ToggleButton expanded={expanded} onToggle={onToggle} />
      </div>
      <Flex direction="column" gap={1} className={classes.wrapper}>
        <Flex gap={2} alignItems="center">
          {expanded && header}
          {!expanded && collapsedChildren}
        </Flex>
        {expanded && children}
      </Flex>
    </Box>
  </button>
)

export default Drawer
