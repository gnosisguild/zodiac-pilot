import cn from 'classnames'
import { ComponentPropsWithoutRef } from 'react'
import classes from './style.module.css'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  secondary?: boolean
  fluid?: boolean
}

export const Button = ({
  className,
  secondary = false,
  fluid = false,
  ...rest
}: ButtonProps) => (
  <button
    className={cn(
      'flex items-center justify-center whitespace-nowrap border-[3px] border-double bg-gradient-to-r from-zodiac-dark-blue via-zodiac-light-blue to-zodiac-dark-blue p-2 font-spectral text-base text-white transition-all enabled:hover:cursor-pointer enabled:hover:border-zodiac-light-mustard disabled:opacity-60',
      secondary && 'bg-none',
      fluid && 'flex-1',
      classes.button,
      className
    )}
    {...rest}
  />
)
