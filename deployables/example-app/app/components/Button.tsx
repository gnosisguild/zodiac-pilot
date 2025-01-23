import classNames from 'classnames'
import type { ComponentPropsWithRef } from 'react'

type ButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  'className' | 'style'
> & {
  style?: 'default' | 'critical'
}

export const Button = ({ style = 'default', ...props }: ButtonProps) => (
  <button
    {...props}
    className={classNames(
      'text-nowrap rounded-sm border border-transparent px-4 py-2 font-semibold text-white outline-hidden ring-2 ring-transparent transition-colors',
      style === 'default' &&
        'bg-gray-900 hover:bg-gray-800 focus:border-purple-700 focus:ring-purple-400',
      style === 'critical' && 'bg-red-500 hover:bg-red-600',
    )}
  />
)
