import cn from 'classnames'
import React from 'react'

import classNames from './style.module.css'

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
      classNames.box,
      classNames[`p${p}`],
      {
        [classNames.double]: double,
        [classNames.borderless]: borderless,
        [classNames.rounded]: rounded,
        [classNames.bg]: bg,
        [classNames.roundedLeft]: roundedLeft,
        [classNames.roundedRight]: roundedRight,
      },
      className
    )}
  >
    {children}
  </div>
)

export default Box
