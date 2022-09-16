import cn from 'classnames'
import React from 'react'

import classes from './style.module.css'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  danger?: boolean
}

const IconButton: React.FC<Props> = ({ className, danger, ...rest }) => (
  <button
    className={cn(classes.button, className, { [classes.danger]: danger })}
    {...rest}
  />
)

export default IconButton
