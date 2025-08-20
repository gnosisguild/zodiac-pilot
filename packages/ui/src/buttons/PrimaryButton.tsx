import cn from 'classnames'
import type { ReactNode } from 'react'
import {
  BaseButton,
  BaseLinkButton,
  type BaseButtonProps,
  type BaseLinkButtonProps,
} from './BaseButton'
import {
  BaseButtonGroup,
  BaseButtonGroupAction,
  BaseButtonGroupItem,
  BaseButtonGroupMenu,
  BaseButtonGroupTrigger,
  type BaseButtonGroupProps,
} from './BaseButtonGroup'
import type { WithStyle } from './types'

type PrimaryButtonProps = WithStyle<Omit<BaseButtonProps, 'className'>>

export const PrimaryButton = ({
  style = 'regular',
  ...props
}: PrimaryButtonProps) => (
  <BaseButton
    {...props}
    className={cn(
      'border-transparent font-bold ring-2 ring-transparent focus:border-white focus:ring-indigo-600 dark:focus:border-transparent dark:focus:ring-teal-400',
      style === 'regular' &&
        'bg-zinc-900 text-zinc-50 enabled:hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-50',
      style === 'warning' &&
        'bg-amber-600 text-white enabled:hover:bg-amber-500 dark:bg-amber-500 dark:text-amber-950 dark:enabled:hover:bg-amber-600',
      style === 'critical' &&
        'bg-red-600 text-white enabled:hover:bg-red-500 dark:bg-red-500 dark:enabled:hover:bg-red-600',
    )}
  />
)

const PrimaryButtonGroupItem = ({
  style = 'regular',
  size = 'small',
  align = 'left',
  ...props
}: PrimaryButtonProps) => (
  <BaseButtonGroupItem
    {...props}
    size={size}
    align={align}
    className={cn(
      style === 'regular' &&
        'text-zinc-900 focus:bg-indigo-500 focus:text-white enabled:hover:bg-zinc-100',
    )}
  />
)

type PrimaryButtonGroupProps = WithStyle<
  Omit<BaseButtonGroupProps, 'className' | 'trigger' | 'menu'>
> &
  PrimaryButtonProps & {
    groupLabel: string
    group: (component: typeof PrimaryButtonGroupItem) => ReactNode
  }

export const PrimaryButtonGroup = ({
  style = 'regular',
  groupLabel,
  group,
  disabled,
  ...props
}: PrimaryButtonGroupProps) => (
  <BaseButtonGroup
    disabled={disabled}
    trigger={
      <BaseButtonGroupTrigger
        className={cn(
          style === 'regular' &&
            'border-transparent bg-zinc-900 text-zinc-50 focus:bg-indigo-500 enabled:hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:focus:bg-teal-500 dark:focus:text-white dark:enabled:hover:bg-zinc-50',
        )}
      >
        {groupLabel}
      </BaseButtonGroupTrigger>
    }
    menu={
      <BaseButtonGroupMenu
        className={cn(
          'ring-1',
          style === 'regular' && 'bg-white ring-black/5 dark:bg-white',
        )}
      >
        {group(PrimaryButtonGroupItem)}
      </BaseButtonGroupMenu>
    }
    className={cn(
      'font-bold ring-2 ring-transparent',
      style === 'regular' &&
        'border-transparent bg-zinc-900 text-zinc-50 focus-within:border-white focus-within:ring-indigo-600 enabled:hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:focus-within:border-transparent dark:focus-within:ring-teal-400 dark:enabled:hover:bg-zinc-50',
    )}
  >
    <BaseButtonGroupAction
      {...props}
      className={cn(
        style === 'regular' &&
          'border-transparent bg-zinc-900 text-zinc-50 focus:bg-indigo-500 enabled:hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:focus:bg-teal-500 dark:focus:text-white dark:enabled:hover:bg-zinc-50',
      )}
    />
  </BaseButtonGroup>
)

type PrimaryLinkButtonProps = WithStyle<Omit<BaseLinkButtonProps, 'className'>>

export const PrimaryLinkButton = ({
  style = 'regular',
  ...props
}: PrimaryLinkButtonProps) => (
  <BaseLinkButton
    {...props}
    className={cn(
      'border-transparent font-bold ring-2 ring-transparent focus:border-white focus:ring-indigo-600 dark:focus:border-transparent dark:focus:ring-teal-400',
      style === 'regular' &&
        'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-50',
      style === 'critical' &&
        'bg-red-600 text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600',
    )}
  />
)
