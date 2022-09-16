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
  style?: React.CSSProperties
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
      style,
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
        ...style,
      }}
    >
      {children}
    </div>
  )
)
Flex.displayName = 'Flex'

export default Flex
