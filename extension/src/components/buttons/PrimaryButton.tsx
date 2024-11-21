import cn from 'classnames'
import { BaseButton, BaseButtonProps } from './BaseButton'
import { WithStyle } from './types'

type PrimaryButtonProps = WithStyle<Omit<BaseButtonProps, 'className'>>

export const PrimaryButton = ({
  style = 'regular',
  ...props
}: PrimaryButtonProps) => (
  <BaseButton
    className={cn(
      'px-4 py-2 font-bold',
      style === 'regular' &&
        'border-zinc border-zinc-500 bg-zinc-700 text-zinc-50 enabled:hover:bg-zinc-600'
    )}
    {...props}
  />
)
