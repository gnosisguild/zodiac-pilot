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
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
  <div
    onClick={expanded ? undefined : onToggle}
    className={cn(classes.container, { [classes.collapsed]: !expanded })}
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
  </div>
)

export default Drawer
