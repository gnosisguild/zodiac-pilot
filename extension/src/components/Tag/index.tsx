import cn from 'classnames'
import React, { ReactNode } from 'react'

import classes from './style.module.css'

interface Props {
  head?: ReactNode
  color: 'success' | 'danger' | 'warning' | 'info'
  className?: string
}

const Tag: React.FC<Props> = ({ head, children, color, className }) => (
  <div className={cn(className, classes.container, classes[color])}>
    {head && <div className={classes.head}>{head}</div>}
    {children && <div className={classes.body}>{children}</div>}
  </div>
)

export default Tag
