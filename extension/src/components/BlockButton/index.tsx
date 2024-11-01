import cn from 'classnames'
import { ComponentPropsWithoutRef } from 'react'
import classes from './style.module.css'

export const BlockButton = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'button'>) => (
  <button className={cn(classes.button, className)} {...rest} />
)
