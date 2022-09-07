import cn from 'classnames'
import React, { forwardRef } from 'react'

import classes from './style.module.css'

interface Props {
  direction?: 'row' | 'column'
  justifyContent?: 'space-around' | 'space-between' | 'center' | 'end' | 'start'
  alignItems?: 'normal' | 'stretch' | 'center' | 'end' | 'start'
  gap: 0 | 1 | 2 | 3 | 4
  className?: string
  children?: React.ReactNode
}

const Flex = forwardRef<HTMLDivElement | null, Props>(
  (
    {
      gap,
      direction = 'row',
      justifyContent = 'start',
      alignItems = 'normal',
      children,
      className,
    },
    ref
  ) => (
    <div
      ref={ref}
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
)
Flex.displayName = 'Flex'

export default Flex
