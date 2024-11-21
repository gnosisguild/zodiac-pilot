import cn from 'classnames'
import { BaseButton, BaseButtonProps } from './BaseButton'

type ButtonProps = Omit<BaseButtonProps, 'className'> & {
  secondary?: boolean
}

export const Button = ({
  secondary = false,

  ...rest
}: ButtonProps) => (
  <BaseButton
    className={cn(
      'bg-gradient-to-r from-zodiac-dark-blue via-zodiac-light-blue to-zodiac-dark-blue p-2 text-white enabled:hover:border-zodiac-light-mustard',
      secondary && 'bg-none'
    )}
    {...rest}
  />
)
