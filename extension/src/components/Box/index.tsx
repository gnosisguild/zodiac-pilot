import cn from 'classnames'
import React, {
  forwardRef,
  ReactNode,
  MouseEvent as ReactMouseEvent,
} from 'react'

import classes from './style.module.css'

interface Props {
  className?: string
  double?: boolean
  borderless?: boolean
  bg?: boolean
  rounded?: boolean
  roundedLeft?: boolean
  roundedRight?: boolean
  p?: 1 | 2 | 3
  children?: ReactNode
  onClick?: (event: ReactMouseEvent<HTMLDivElement, MouseEvent>) => void
}

const Box = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      className,
      double,
      borderless,
      bg,
      rounded,
      roundedLeft,
      roundedRight,
      p = 1,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        classes.box,
        classes[`p${p}`],
        {
          [classes.double]: double,
          [classes.borderless]: borderless,
          [classes.rounded]: rounded,
          [classes.bg]: bg,
          [classes.roundedLeft]: roundedLeft,
          [classes.roundedRight]: roundedRight,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Box.displayName = 'Box'

export default Box
