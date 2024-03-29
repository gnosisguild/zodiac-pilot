import cn from 'classnames'
import React from 'react'

import classes from './style.module.css'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

const BoxButton: React.FC<Props> = ({ className, ...rest }) => (
  <button className={cn(classes.button, className)} {...rest} />
)

export default BoxButton
