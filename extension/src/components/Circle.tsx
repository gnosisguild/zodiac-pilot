import classNames from 'classnames'
import { PropsWithChildren } from 'react'

type CircleProps = {
  size?: 'sm' | 'base'
}

export const Circle = ({
  children,
  size = 'base',
}: PropsWithChildren<CircleProps>) => (
  <div
    className={classNames(
      'relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-green-900',
      size === 'base' && 'size-12',
      size === 'sm' && 'size-8'
    )}
  >
    {children}
  </div>
)
