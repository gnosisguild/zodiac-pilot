import cn from 'classnames'
import React from 'react'

import classes from './style.module.css'

interface Props {
  justifyContent?: 'spaceAround' | 'spaceBetween' | 'center' | 'end' | 'start'
  direction?: 'row' | 'column'
  gap: 0 | 1 | 2 | 3
}

const Flex: React.FC<Props> = ({
  gap,
  direction = 'row',
  justifyContent = 'start',
  children,
}) => (
  <div
    className={cn(
      classes.flex,
      classes[`gap${gap}`],
      classes[direction],
      classes[justifyContent]
    )}
  >
    {children}
  </div>
)

export default Flex
