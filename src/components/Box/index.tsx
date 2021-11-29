import cls from 'classnames'
import React from 'react'

import classNames from './style.module.css'

interface Props {
  className?: string
}

const Box: React.FC<Props> = ({ children, className }) => (
  <div className={cls(className, classNames.box)}>{children}</div>
)

export default Box
