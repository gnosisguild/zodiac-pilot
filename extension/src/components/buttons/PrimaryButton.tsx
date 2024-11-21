import cn from 'classnames'
import { BaseButton, BaseButtonProps } from './BaseButton'

type PrimaryButtonProps = Omit<BaseButtonProps, 'className'>

export const PrimaryButton = (props: PrimaryButtonProps) => (
  <BaseButton
    className={cn(
      'bg-gradient-to-r from-zodiac-dark-blue via-zodiac-light-blue to-zodiac-dark-blue p-2 text-white enabled:hover:border-zodiac-light-mustard'
    )}
    {...props}
  />
)
