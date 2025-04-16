import classNames from 'classnames'
import type { ReactNode } from 'react'

type Props = {
  id?: string
  head?: ReactNode
  color?: 'green' | 'red' | 'amber' | 'blue' | 'gray'
  children?: ReactNode
}

export const Tag = ({ id, head, children, color = 'blue' }: Props) => (
  <div
    aria-hidden
    id={id}
    className={classNames(
      'rounded-xs inline-flex cursor-default select-none items-center justify-center gap-2 whitespace-nowrap border font-semibold',
      color === 'red' &&
        'border-red-400/80 bg-red-50/80 text-red-600 dark:border-red-800/80 dark:bg-red-900/10 dark:text-red-500/80',
      color === 'green' &&
        'border-green-400/80 bg-green-50/80 text-green-600 dark:border-green-800/80 dark:bg-green-900/10 dark:text-green-500/80',
      color === 'amber' &&
        'border-yellow-400/80 bg-yellow-50/80 text-yellow-600 dark:border-yellow-800/80 dark:bg-yellow-900/10 dark:text-yellow-500/80',
      color === 'blue' &&
        'border-blue-400/80 bg-blue-50/80 text-blue-600 dark:border-blue-800/80 dark:bg-blue-900/10 dark:text-blue-400/80',
      color === 'gray' &&
        'border-zinc-400/80 bg-zinc-50/80 text-zinc-600 dark:border-zinc-600/80 dark:bg-zinc-900/10 dark:text-zinc-400/80',
    )}
  >
    {head && (
      <div
        className={classNames(
          'flex size-4 items-center justify-center rounded-full',
          children ? 'my-1 ml-2' : 'm-1',
        )}
      >
        {head}
      </div>
    )}

    {children && (
      <div
        className={classNames('py-1 text-xs', head == null ? 'px-2' : 'pr-2')}
      >
        {children}
      </div>
    )}
  </div>
)
