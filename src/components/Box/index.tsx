import cls from 'classnames'
import React from 'react'

import classNames from './style.module.css'

interface Props {
  className?: string
  double?: boolean
  bg?: boolean
  rounded?: boolean
  roundedLeft?: boolean
  p?: 1 | 2 | 3
}

const Box: React.FC<Props> = ({
  children,
  className,
  double,
  bg,
  rounded,
  roundedLeft,
  p = 1,
}) => (
  <div
    className={cls(className, classNames.box, classNames[`p${p}`], {
      [classNames.double]: double,
      [classNames.rounded]: rounded,
      [classNames.bg]: bg,
      [classNames.roundedLeft]: roundedLeft,
    })}
  >
    {children}
  </div>
)

export default Box
