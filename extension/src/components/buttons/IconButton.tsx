import cn from 'classnames'
import { ComponentPropsWithoutRef } from 'react'
import { BaseButton } from './BaseButton'

type Props = ComponentPropsWithoutRef<'button'> & {
  danger?: boolean
}

export const IconButton = ({ className, danger, ...rest }: Props) => (
  <BaseButton
    className={cn(
      'size-9 border-transparent bg-transparent p-1',
      danger ? 'text-red-500' : 'text-white',
      className
    )}
    {...rest}
  />
)
