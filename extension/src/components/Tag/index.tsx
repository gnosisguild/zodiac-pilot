import classNames from 'classnames'
import { ReactNode } from 'react'

interface Props {
  head?: ReactNode
  color: 'success' | 'danger' | 'warning' | 'info'
  children?: ReactNode
}

export const Tag = ({ head, children, color }: Props) => (
  <div
    className={classNames(
      'inline-flex items-center justify-center gap-1 rounded-full border text-white',
      color === 'danger' && 'border-red-600 bg-red-800 text-red-100',
      color === 'success' && 'border-green-600 bg-green-800 text-green-100',
      color === 'warning' && 'border-amber-600 bg-amber-800 text-amber-100',
      color === 'info' && 'border-blue-600 bg-blue-800 text-blue-100'
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
