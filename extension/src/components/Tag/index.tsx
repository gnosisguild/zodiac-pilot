import cn from 'classnames'
import { ReactNode } from 'react'
import classes from './style.module.css'

interface Props {
  head?: ReactNode
  color: 'success' | 'danger' | 'warning' | 'info'
  className?: string
  children?: ReactNode
}

export const Tag = ({ head, children, color, className }: Props) => (
  <div className={cn(classes.container, classes[color], className)}>
    {head && <div className={classes.head}>{head}</div>}
    {children && <div className={classes.body}>{children}</div>}
  </div>
)
