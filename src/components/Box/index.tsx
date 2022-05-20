import cn from 'classnames'
import React from 'react'

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
}

const Box: React.FC<Props> = ({
  children,
  className,
  double,
  borderless,
  bg,
  rounded,
  roundedLeft,
  roundedRight,
  p = 1,
}) => (
  <div
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
  >
    {children}
  </div>
)

export default Box
