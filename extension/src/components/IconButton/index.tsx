import cn from 'classnames'
import { ComponentPropsWithoutRef } from 'react'
import classes from './style.module.css'

type Props = ComponentPropsWithoutRef<'button'> & {
  danger?: boolean
}

export const IconButton = ({ className, danger, ...rest }: Props) => (
  <button
    className={cn(classes.button, { [classes.danger]: danger }, className)}
    {...rest}
  />
)
