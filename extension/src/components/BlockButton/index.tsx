import cn from 'classnames'
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import classes from './style.module.css'

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export const BlockButton = ({ className, ...rest }: Props) => (
  <button className={cn(classes.button, className)} {...rest} />
)
