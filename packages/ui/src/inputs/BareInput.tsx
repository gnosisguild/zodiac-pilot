import classNames from 'classnames'
import type { ComponentPropsWithRef } from 'react'

export type TextAlign = 'left' | 'center' | 'right'

export const BareInput = ({
  textAlign = 'left',
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'className'> & {
  textAlign?: TextAlign
}) => (
  <input
    {...props}
    className={classNames(
      'outline-hidden w-full appearance-none border-none bg-transparent px-4 py-2 text-sm',

      textAlign === 'center' && 'text-center',
      textAlign === 'right' && 'text-right',
    )}
  />
)
