import cn from 'classnames'
import React, { ReactNode } from 'react'

import Box from '../Box'
import Flex from '../Flex'

import ToggleButton from './ToggleButton'
import classes from './style.module.css'

interface Props {
  children: ReactNode
  collapsedChildren?: ReactNode
  expanded: boolean
  onToggle(): void
}

const Drawer: React.FC<Props> = ({
  children,
  expanded,
  onToggle,
  collapsedChildren,
}) => (
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
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

      <Flex
        direction="column"
        gap={1}
        className={classes.wrapper}
        style={{ display: expanded ? 'none' : 'flex' }}
      >
        {collapsedChildren}
      </Flex>

      <Flex
        direction="column"
        gap={1}
        className={classes.wrapper}
        style={{ display: expanded ? 'flex' : 'none' }}
      >
        {children}
      </Flex>
    </Box>
  </div>
)

export default Drawer
