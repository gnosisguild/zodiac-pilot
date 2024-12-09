import classNames from 'classnames'
import type { ReactNode } from 'react'

interface Props {
  head?: ReactNode
  color: 'success' | 'danger' | 'warning' | 'info'
  children?: ReactNode
}

export const Tag = ({ head, children, color }: Props) => (
  <div
    className={classNames(
      'inline-flex items-center justify-center gap-2 rounded-sm border font-semibold',
      color === 'danger' &&
        'border-red-400/80 bg-red-50/80 text-red-600 dark:border-red-800/80 dark:bg-red-900/10 dark:text-red-500/80',
      color === 'success' &&
        'border-green-400/80 bg-green-50/80 text-green-600 dark:border-green-800/80 dark:bg-green-900/10 dark:text-green-500/80',
      color === 'warning' &&
        'border-yellow-400/80 bg-yellow-50/80 text-yellow-600 dark:border-yellow-800/80 dark:bg-yellow-900/10 dark:text-yellow-500/80',
      color === 'info' &&
        'border-blue-400/80 bg-blue-50/80 text-blue-600 dark:border-blue-800/80 dark:bg-blue-900/10 dark:text-blue-400/80'
    )}
  >
    {head && (
      <div
        className={classNames(
          'flex size-4 items-center justify-center rounded-full',
          children ? 'my-1 ml-2' : 'm-1'
        )}
      >
        {head}
      </div>
    )}

    {children && <div className="py-1 pr-2 text-xs">{children}</div>}
  </div>
)
