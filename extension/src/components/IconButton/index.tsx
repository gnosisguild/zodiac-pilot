import cn from 'classnames'
import React from 'react'
import classes from './style.module.css'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  danger?: boolean
}

export const IconButton: React.FC<Props> = ({ className, danger, ...rest }) => (
  <button
    className={cn(classes.button, { [classes.danger]: danger }, className)}
    {...rest}
  />
)
