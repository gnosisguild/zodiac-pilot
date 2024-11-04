import cn from 'classnames'
import { ComponentProps, ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'
import classes from './style.module.css'

export const BoxButton = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'button'>) => (
  <button className={cn(classes.button, className)} {...rest} />
)

export const BoxLink = ({
  className,
  ...rest
}: ComponentProps<typeof Link>) => (
  <Link className={cn(classes.button, 'no-underline', className)} {...rest} />
)
