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
        'text-zinc-500 enabled:hover:bg-zinc-200 enabled:hover:text-zinc-700 dark:text-zinc-400 dark:enabled:hover:bg-zinc-100/10 dark:enabled:hover:text-zinc-300',
      style === 'contrast' &&
        'text-zinc-400 enabled:hover:bg-zinc-800 enabled:hover:text-zinc-300 dark:text-zinc-500 dark:enabled:hover:bg-zinc-200 dark:enabled:hover:text-zinc-700',
      style === 'critical' &&
        'text-red-500 enabled:hover:bg-red-100 dark:text-red-500 dark:enabled:hover:bg-red-900 dark:enabled:hover:text-red-400',
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
        'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-100/10 dark:hover:text-zinc-300',
      style === 'contrast' &&
        'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 dark:text-zinc-500 dark:hover:bg-zinc-200 dark:hover:text-zinc-700',
      style === 'critical' &&
        'text-red-500 hover:bg-red-900 hover:text-red-400',
    )}
  />
)
