import cn from 'classnames'
import React from 'react'

import classes from './style.module.css'

interface Props {
  direction?: 'row' | 'column'
  justifyContent?: 'space-around' | 'space-between' | 'center' | 'end' | 'start'
  alignItems?: 'normal' | 'stretch' | 'center' | 'end' | 'start'
  gap: 0 | 1 | 2 | 3 | 4
  className?: string
}

const Flex: React.FC<Props> = ({
  gap,
  direction = 'row',
  justifyContent = 'start',
  alignItems = 'normal',
  children,
  className,
}) => (
  <div
    className={cn(
      classes.flex,
      classes[`gap${gap}`],
      classes[direction],
      className
    )}
    style={{
      justifyContent,
      alignItems,
    }}
  >
    {children}
  </div>
)

export default Flex
