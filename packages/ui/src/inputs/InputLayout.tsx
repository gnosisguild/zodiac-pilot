import classNames from 'classnames'
import type { PropsWithChildren, ReactNode } from 'react'

export type InputLayoutProps = PropsWithChildren<{
  before?: ReactNode
  after?: ReactNode
  disabled?: boolean
}>

export const InputLayout = ({
  before,
  after,
  disabled,
  children,
}: InputLayoutProps) => (
  <div
    className={classNames(
      'shadow-2xs flex items-center rounded-md border border-zinc-300 bg-zinc-100 ring-2 ring-transparent transition-all transition-opacity focus-within:border-transparent focus-within:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus-within:ring-teal-400',
      disabled && 'cursor-not-allowed',
      !disabled && 'dark:hover:border-zinc-500',
    )}
  >
    {before}

    <div className="flex-1">{children}</div>

    {after}
  </div>
)
