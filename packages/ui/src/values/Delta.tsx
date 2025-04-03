import classNames from 'classnames'
import { type ReactNode } from 'react'

type DiffProps = {
  value?: number
  children: ReactNode
  invertedBackground?: boolean
}

export const Delta = ({ value, children, invertedBackground }: DiffProps) => {
  if (!value) {
    return <>{children}</>
  }

  const diffColor =
    value > 0
      ? invertedBackground
        ? 'text-green-400 dark:text-green-600'
        : 'text-green-600 dark:text-green-400'
      : invertedBackground
        ? 'text-red-400 dark:text-red-600'
        : 'text-red-600 dark:text-red-400'

  return (
    <span className={classNames('inline-flex items-center gap-2', diffColor)}>
      {children}
    </span>
  )
}
