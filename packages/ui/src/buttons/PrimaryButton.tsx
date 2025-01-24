import cn from 'classnames'
import {
  BaseButton,
  type BaseButtonProps,
  BaseLinkButton,
  type BaseLinkButtonProps,
} from './BaseButton'
import type { WithStyle } from './types'

type PrimaryButtonProps = WithStyle<Omit<BaseButtonProps, 'className'>>

export const PrimaryButton = ({
  style = 'regular',
  ...props
}: PrimaryButtonProps) => (
  <BaseButton
    {...props}
    className={cn(
      'font-bold ring-2 ring-transparent',
      style === 'regular' &&
        'border-transparent bg-zinc-900 text-zinc-50 focus:border-white focus:ring-indigo-600 enabled:hover:bg-zinc-800 dark:border-zinc-500 dark:bg-zinc-700 dark:focus:border-transparent dark:focus:ring-teal-400 dark:enabled:hover:bg-zinc-600',
      style === 'contrast' &&
        'border-transparent border-zinc-500 bg-zinc-700 text-white focus:border-white focus:ring-indigo-600 enabled:hover:bg-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-transparent dark:focus:ring-teal-400 dark:enabled:hover:bg-zinc-800',
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
      'font-bold ring-2 ring-transparent',
      style === 'regular' &&
        'border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-800 focus:border-white focus:ring-indigo-600 dark:border-zinc-500 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:focus:border-transparent dark:focus:ring-teal-400',
      style === 'contrast' &&
        'border-transparent border-zinc-500 bg-zinc-700 hover:bg-zinc-600 focus:border-white focus:ring-indigo-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:border-transparent dark:focus:ring-teal-400',
    )}
  />
)
