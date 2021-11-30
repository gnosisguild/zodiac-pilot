import cls from 'classnames'
import React from 'react'

import classes from './style.module.css'

const Button: React.FC<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> = ({ className, ...rest }) => (
  <button className={cls(classes.button, className)} {...rest} />
)

export default Button
