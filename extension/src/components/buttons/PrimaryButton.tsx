import cn from 'classnames'
import {
  BaseButton,
  BaseButtonProps,
  BaseLinkButton,
  BaseLinkButtonProps,
} from './BaseButton'
import { WithStyle } from './types'

type PrimaryButtonProps = WithStyle<Omit<BaseButtonProps, 'className'>>

export const PrimaryButton = ({
  style = 'regular',
  ...props
}: PrimaryButtonProps) => (
  <BaseButton
    {...props}
    className={cn(
      'font-bold',
      style === 'regular' &&
        'border-transparent bg-zinc-900 text-zinc-50 enabled:hover:bg-zinc-800 dark:border-zinc-500 dark:bg-zinc-700 dark:enabled:hover:bg-zinc-600',
      style === 'contrast' &&
        'border-transparent border-zinc-500 bg-zinc-700 enabled:hover:bg-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:enabled:hover:bg-zinc-800'
    )}
  />
)

type PrimaryLinkButtonProps = WithStyle<Omit<BaseLinkButtonProps, 'className'>>

export const PrimaryLinkButton = ({
  style = 'regular',
  ...props
}: PrimaryLinkButtonProps) => (
  <BaseLinkButton
    {...props}
    className={cn(
      'font-bold',
      style === 'regular' &&
        'border-zinc border-zinc-500 bg-zinc-700 text-zinc-50 hover:bg-zinc-600'
    )}
  />
)
