import classNames from 'classnames'
import {
  BaseButton,
  type BaseButtonProps,
  BaseLinkButton,
  type BaseLinkButtonProps,
} from './BaseButton'
import type { WithStyle } from './types'

type GhostButtonProps = WithStyle<Omit<BaseButtonProps, 'className'>>

export const GhostButton = ({
  style = 'regular',
  ...props
}: GhostButtonProps) => (
  <BaseButton
    {...props}
    className={classNames(
      'border-transparent bg-transparent font-bold',
      style === 'regular' &&
        'text-zinc-500 focus:bg-indigo-600 focus:text-indigo-100 enabled:hover:bg-zinc-200 enabled:hover:text-zinc-700 dark:text-zinc-400 dark:focus:bg-teal-400 dark:focus:text-teal-900 dark:enabled:hover:bg-zinc-100/10 dark:enabled:hover:text-zinc-300',
      style === 'critical' &&
        'text-red-500 focus:bg-red-600 focus:text-white enabled:hover:bg-red-100 dark:text-red-500 dark:focus:bg-red-700 dark:focus:text-red-100 dark:enabled:hover:bg-red-900 dark:enabled:hover:text-red-400',
    )}
  />
)

type GhostLinkButtonProps = WithStyle<Omit<BaseLinkButtonProps, 'className'>>

export const GhostLinkButton = ({
  style = 'regular',
  ...props
}: GhostLinkButtonProps) => (
  <BaseLinkButton
    {...props}
    className={classNames(
      'border-transparent bg-transparent font-bold',
      style === 'regular' &&
        'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 focus:bg-indigo-600 focus:text-indigo-100 dark:text-zinc-400 dark:hover:bg-zinc-100/10 dark:hover:text-zinc-300 dark:focus:bg-teal-400 dark:focus:text-teal-900',
      style === 'critical' &&
        'text-red-500 hover:bg-red-100 focus:bg-red-600 focus:text-white dark:hover:bg-red-950 dark:hover:text-red-400 dark:focus:bg-red-700 dark:focus:text-red-100',
    )}
  />
)
