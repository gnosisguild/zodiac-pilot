import cn from 'classnames'
import { ComponentPropsWithoutRef } from 'react'
import classes from './style.module.css'

export const BlockLink = ({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<'a'>) => (
  <a className={cn(classes.link, className)} {...rest}>
    {children}
  </a>
)
