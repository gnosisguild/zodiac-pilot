import cn from 'classnames'
import { ComponentPropsWithoutRef } from 'react'

type Props = ComponentPropsWithoutRef<'button'> & {
  danger?: boolean
}

export const IconButton = ({ className, danger, ...rest }: Props) => (
  <button
    className={cn(
      'flex size-9 cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-60',
      danger ? 'text-red-500' : 'text-white',
      className
    )}
    {...rest}
  />
)
