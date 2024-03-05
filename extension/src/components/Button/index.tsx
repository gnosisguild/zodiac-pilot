import cn from 'classnames'
import React from 'react'

import classes from './style.module.css'

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  secondary?: boolean
}
const Button: React.FC<ButtonProps> = ({
  className,
  secondary = false,
  ...rest
}) => (
  <button
    className={cn(classes.button, className, secondary && classes.secondary)}
    {...rest}
  />
)

export default Button
