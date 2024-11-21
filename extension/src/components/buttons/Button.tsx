import cn from 'classnames'
import { ComponentPropsWithoutRef } from 'react'
import { BaseButton } from './BaseButton'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  secondary?: boolean
  fluid?: boolean
}

export const Button = ({
  className,
  secondary = false,

  ...rest
}: ButtonProps) => (
  <BaseButton
    className={cn(
      'bg-gradient-to-r from-zodiac-dark-blue via-zodiac-light-blue to-zodiac-dark-blue p-2 text-white enabled:hover:border-zodiac-light-mustard',
      secondary && 'bg-none',
      className
    )}
    {...rest}
  />
)
