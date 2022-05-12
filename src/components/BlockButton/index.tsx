import cn from 'classnames'
import React from 'react'

import classes from './style.module.css'

const BlockButton: React.FC<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> = ({ className, ...rest }) => (
  <button className={cn(classes.button, className)} {...rest} />
)

export default BlockButton
