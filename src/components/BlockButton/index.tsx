import cn from 'classnames'
import React from 'react'

import classes from './style.module.css'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

const BlockButton: React.FC<Props> = ({ className, ...rest }) => (
  <button className={cn(className, classes.button)} {...rest} />
)

export default BlockButton
