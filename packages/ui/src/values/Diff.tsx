import classNames from 'classnames'
import { type ReactNode } from 'react'

type DiffProps = {
  value?: number
  children: ReactNode
}

export const Diff = ({ value, children }: DiffProps) => {
  if (value == null) {
    return <>{children}</>
  }

  const diffColor =
    value > 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'

  return (
    <span className={classNames('inline-flex items-center gap-2', diffColor)}>
      {children}
    </span>
  )
}
